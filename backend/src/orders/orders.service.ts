import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderEventType, OrderStatus, Prisma } from '@prisma/client';
import { couponApplicabilityError, couponDiscountCents } from '../common/coupon';
import { buildPaginated, paginate } from '../common/pagination';
import { effectivePriceCents } from '../common/pricing';
import { FeeGroupsService } from '../feegroups/feegroups.service';
import { InventoryService } from '../inventory/inventory.service';
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

// CANCELLED/REFUNDED reverse the order's stock when first entered; once an order
// is DELIVERED or already reversed, its stock is considered consumed and is not
// restored if the order is later deleted.
const STOCK_REVERSING_STATUSES: OrderStatus[] = ['CANCELLED', 'REFUNDED'];
const STOCK_CONSUMED_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'REFUNDED'];

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

  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException(`Customer ${dto.customerId} not found`);

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
      ? await this.prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
        })
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

    const subtotalCents = lineItems.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0,
    );
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
      if (error || !coupon) throw new BadRequestException(error ?? 'Invalid coupon');
      discountCents = couponDiscountCents(coupon, subtotalCents);
      couponCode = coupon.code;
      couponId = coupon.id;
    }

    const totalCents = Math.max(
      0,
      subtotalCents - discountCents + taxCents + shippingCents + feesCents,
    );

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
          subtotalCents,
          discountCents,
          couponCode,
          taxCents,
          shippingCents,
          feesCents,
          feesLabel,
          totalCents,
          currency,
          notes: dto.notes,
          ...shipping,
          items: { create: lineItems },
        },
        include: orderInclude,
      });
      // Reserve stock for every line; throws (rolling back the whole order) if
      // any product/variant is short.
      await this.inventory.applyOrderDecrements(
        tx,
        created.id,
        lineItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          label: i.variantName ? `${i.name} (${i.variantName})` : i.name,
        })),
      );
      // Count the redemption when an order actually uses the coupon. The
      // increment takes a row lock so concurrent orders serialize here; we then
      // verify the new count is within the limit and roll back if it isn't —
      // closing the check-then-increment race in the pre-transaction validation.
      if (couponId) {
        const updated = await tx.coupon.update({
          where: { id: couponId },
          data: { redeemedCount: { increment: 1 } },
        });
        if (updated.maxRedemptions != null && updated.redeemedCount > updated.maxRedemptions) {
          throw new BadRequestException('Coupon redemption limit reached');
        }
      }
      await this.events.record(tx, created.id, OrderEventType.CREATED, {
        totalCents,
        currency,
        itemCount: lineItems.length,
      });
      return created;
    });

    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.findById(id);
    const entersReversal =
      dto.status !== undefined &&
      STOCK_REVERSING_STATUSES.includes(dto.status) &&
      !STOCK_REVERSING_STATUSES.includes(existing.status);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: dto });

      if (dto.status !== undefined && dto.status !== existing.status) {
        await this.events.record(tx, id, OrderEventType.STATUS_CHANGED, {
          from: existing.status,
          to: dto.status,
        });
      }
      // Cancelling/refunding returns the reserved stock to inventory.
      if (entersReversal) {
        await this.inventory.restoreOrderStock(tx, id);
        await this.events.record(tx, id, OrderEventType.STOCK_RESTORED);
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
      // Return stock if this order was still holding it (e.g. a pending order
      // deleted in error). Delivered/cancelled/refunded stock is left as-is.
      if (!STOCK_CONSUMED_STATUSES.includes(existing.status)) {
        await this.inventory.restoreOrderStock(tx, id);
      }
      await tx.order.delete({ where: { id } });
    });
    return { success: true };
  }
}
