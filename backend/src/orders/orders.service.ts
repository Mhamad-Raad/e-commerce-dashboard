import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderEventType, OrderStatus, Prisma } from '@prisma/client';
import { couponApplicabilityError, couponDiscountCents } from '../common/coupon';
import { CSV_MAX_ROWS, toCsv } from '../common/csv';
import { buildPaginated, paginate } from '../common/pagination';
import { effectivePriceCents } from '../common/pricing';
import { FeeGroupsService } from '../feegroups/feegroups.service';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderEventsService } from './order-events.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

const orderInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: { orderBy: { id: 'asc' as const } },
  payments: { orderBy: { createdAt: 'asc' as const } },
};

// Statuses in which an order is NOT holding stock: entering one releases the
// reservation, leaving one re-reserves it. The actual "currently reserved" truth
// lives on Order.stockReserved.
const STOCK_REVERSING_STATUSES: OrderStatus[] = ['CANCELLED', 'REFUNDED'];
const isReversing = (status: OrderStatus) => STOCK_REVERSING_STATUSES.includes(status);

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService,
    private events: OrderEventsService,
    private feeGroups: FeeGroupsService,
    private notifications: NotificationsService,
  ) {}

  listEvents(orderId: string) {
    return this.findById(orderId).then(() => this.events.list(orderId));
  }

  async list(query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { placedAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.order.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async exportCsv(query: ListOrdersQueryDto) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { placedAt: 'desc' },
      take: CSV_MAX_ROWS,
    });

    return toCsv(orders, [
      { header: 'Number', value: (o) => o.number },
      { header: 'Date', value: (o) => o.placedAt.toISOString() },
      { header: 'Customer', value: (o) => o.customer.name },
      { header: 'Email', value: (o) => o.customer.email },
      { header: 'Status', value: (o) => o.status },
      { header: 'Items', value: (o) => o._count.items },
      { header: 'Subtotal', value: (o) => o.subtotalCents },
      { header: 'Discount', value: (o) => o.discountCents },
      { header: 'Tax', value: (o) => o.taxCents },
      { header: 'Shipping', value: (o) => o.shippingCents },
      { header: 'Fees', value: (o) => o.feesCents },
      { header: 'Total', value: (o) => o.totalCents },
      { header: 'Currency', value: (o) => o.currency },
    ]);
  }

  /**
   * Compute an order's line items + money breakdown from the request, without
   * persisting anything. Shared by create() and preview() so the quote staff see
   * before submitting is exactly what gets charged (fee groups + tax included).
   * With softCoupon, an invalid/expired coupon is ignored rather than throwing —
   * used for live previews so a stale code doesn't blank the whole quote.
   */
  private async buildQuote(dto: CreateOrderDto, opts: { softCoupon?: boolean } = {}) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== new Set(productIds).size) {
      throw new BadRequestException('One or more products not found');
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    const variantIds = dto.items
      .map((i) => i.variantId)
      .filter((id): id is string => Boolean(id));
    const variants = variantIds.length
      ? await this.prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
      : [];
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const lineItems = dto.items.map((i) => {
      const product = productMap.get(i.productId)!;
      let variantId: string | null = null;
      let variantName: string | null = null;
      let priceCents = effectivePriceCents(product.priceCents, product.salePriceCents);
      if (i.variantId) {
        const variant = variantMap.get(i.variantId);
        if (!variant || variant.productId !== product.id) {
          throw new BadRequestException(
            `Variant ${i.variantId} does not belong to product ${product.name}`,
          );
        }
        variantId = variant.id;
        variantName = variant.name;
        priceCents = effectivePriceCents(variant.priceCents, variant.salePriceCents);
      }
      return {
        productId: product.id,
        variantId,
        variantName,
        name: product.name,
        sku: product.sku,
        quantity: i.quantity,
        priceCents,
      };
    });

    const subtotalCents = lineItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
    const currency = dto.currency ?? products[0]?.currency ?? 'IQD';

    // Resolve fee groups assigned to the order's stores/brands; staff may still
    // override any individual amount via the DTO.
    const storeIds = [...new Set(products.map((p) => p.storeId))];
    const brandIds = [
      ...new Set(products.map((p) => p.brandId).filter((id): id is string => Boolean(id))),
    ];
    const resolved = await this.feeGroups.resolveForOrder(storeIds, brandIds, subtotalCents);

    const taxCents = dto.taxCents ?? resolved.taxCents;
    const shippingCents = dto.shippingCents ?? 0;
    const feesCents = dto.feesCents ?? resolved.feesCents;
    const feesLabel = dto.feesLabel ?? resolved.feesLabel;

    // Validate + apply an optional coupon against the subtotal.
    let discountCents = 0;
    let couponCode: string | null = null;
    let couponId: string | null = null;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      const error = couponApplicabilityError(coupon, subtotalCents, new Date());
      if (error || !coupon) {
        if (!opts.softCoupon) throw new BadRequestException(error ?? 'Invalid coupon');
      } else {
        discountCents = couponDiscountCents(coupon, subtotalCents);
        couponCode = coupon.code;
        couponId = coupon.id;
      }
    }

    const totalCents = Math.max(
      0,
      subtotalCents - discountCents + taxCents + shippingCents + feesCents,
    );

    return {
      lineItems,
      subtotalCents,
      currency,
      discountCents,
      couponCode,
      couponId,
      taxCents,
      shippingCents,
      feesCents,
      feesLabel,
      totalCents,
    };
  }

  /** Dry-run the money breakdown (fees + tax + discount) for the order form. */
  async preview(dto: CreateOrderDto) {
    const q = await this.buildQuote(dto, { softCoupon: true });
    return {
      subtotalCents: q.subtotalCents,
      discountCents: q.discountCents,
      couponCode: q.couponCode,
      taxCents: q.taxCents,
      shippingCents: q.shippingCents,
      feesCents: q.feesCents,
      feesLabel: q.feesLabel,
      totalCents: q.totalCents,
      currency: q.currency,
    };
  }

  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException(`Customer ${dto.customerId} not found`);

    const quote = await this.buildQuote(dto);

    // Optionally snapshot a customer address as the shipping address.
    let shipping: Partial<Prisma.OrderUncheckedCreateInput> = {};
    if (dto.addressId) {
      const address = await this.prisma.address.findUnique({
        where: { id: dto.addressId },
      });
      if (!address || address.customerId !== dto.customerId) {
        throw new BadRequestException(
          'Selected address does not belong to this customer',
        );
      }
      shipping = {
        shipName: customer.name,
        shipPhone: address.phone ?? customer.phone ?? null,
        shipGovernorate: address.governorate,
        shipCity: address.city,
        shipDistrict: address.district,
        shipStreet: address.street,
        shipLandmark: address.nearestLandmark,
      };
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number: generateOrderNumber(),
          customerId: dto.customerId,
          subtotalCents: quote.subtotalCents,
          discountCents: quote.discountCents,
          couponCode: quote.couponCode,
          taxCents: quote.taxCents,
          shippingCents: quote.shippingCents,
          feesCents: quote.feesCents,
          feesLabel: quote.feesLabel,
          totalCents: quote.totalCents,
          currency: quote.currency,
          notes: dto.notes,
          stockReserved: true,
          ...shipping,
          items: { create: quote.lineItems },
        },
        include: orderInclude,
      });
      // Reserve stock for every line; throws (rolling back the whole order) if
      // any product/variant is short.
      await this.inventory.reserveOrderStock(tx, created.id);
      // Count the redemption when an order actually uses the coupon. The
      // increment takes a row lock so concurrent orders serialize here; we then
      // verify the new count is within the limit and roll back if it isn't —
      // closing the check-then-increment race in the pre-transaction validation.
      if (quote.couponId) {
        const updated = await tx.coupon.update({
          where: { id: quote.couponId },
          data: { redeemedCount: { increment: 1 } },
        });
        if (updated.maxRedemptions != null && updated.redeemedCount > updated.maxRedemptions) {
          throw new BadRequestException('Coupon redemption limit reached');
        }
      }
      await this.events.record(tx, created.id, OrderEventType.CREATED, {
        totalCents: quote.totalCents,
        currency: quote.currency,
        itemCount: quote.lineItems.length,
      });
      await this.notifications.create(
        tx,
        'ORDER_CREATED',
        {
          number: created.number,
          customerName: customer.name,
          totalCents: quote.totalCents,
          currency: quote.currency,
        },
        `/orders/${created.id}`,
      );
      return created;
    });

    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.findById(id);
    const entersReversal =
      dto.status !== undefined && isReversing(dto.status) && !isReversing(existing.status);
    const leavesReversal =
      dto.status !== undefined && !isReversing(dto.status) && isReversing(existing.status);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: dto });

      if (dto.status !== undefined && dto.status !== existing.status) {
        await this.events.record(tx, id, OrderEventType.STATUS_CHANGED, {
          from: existing.status,
          to: dto.status,
        });
      }
      // Cancelling/refunding returns reserved stock; re-opening re-reserves it
      // (and fails the whole update if it was sold elsewhere in the meantime).
      // Order.stockReserved guards against double release/reserve.
      if (entersReversal && existing.stockReserved) {
        await this.inventory.releaseOrderStock(tx, id);
        await tx.order.update({ where: { id }, data: { stockReserved: false } });
        await this.events.record(tx, id, OrderEventType.STOCK_RESTORED);
      } else if (leavesReversal && !existing.stockReserved) {
        await this.inventory.reserveOrderStock(tx, id);
        await tx.order.update({ where: { id }, data: { stockReserved: true } });
        await this.events.record(tx, id, OrderEventType.STOCK_RESERVED);
      }
      if (dto.trackingNumber !== undefined && dto.trackingNumber !== existing.trackingNumber) {
        await this.events.record(tx, id, OrderEventType.TRACKING_UPDATED, {
          tracking: dto.trackingNumber,
        });
      }
      if (dto.notes !== undefined && dto.notes !== existing.notes) {
        await this.events.record(tx, id, OrderEventType.NOTE_UPDATED);
      }
    });
    return this.findById(id);
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    await this.prisma.$transaction(async (tx) => {
      // Return stock only if this order is still holding a reservation.
      if (existing.stockReserved) {
        await this.inventory.releaseOrderStock(tx, id);
      }
      await tx.order.delete({ where: { id } });
    });
    return { success: true };
  }
}
