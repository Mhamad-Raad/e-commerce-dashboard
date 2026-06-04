import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { couponApplicabilityError, couponDiscountCents } from '../common/coupon';
import { buildPaginated, paginate } from '../common/pagination';
import { effectivePriceCents } from '../common/pricing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

const orderInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: { orderBy: { id: 'asc' as const } },
  payments: { orderBy: { createdAt: 'asc' as const } },
};

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
    const taxCents = dto.taxCents ?? 0;
    const shippingCents = dto.shippingCents ?? 0;
    const currency = dto.currency ?? products[0]?.currency ?? 'IQD';

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

    const totalCents = Math.max(0, subtotalCents - discountCents + taxCents + shippingCents);

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
          totalCents,
          currency,
          notes: dto.notes,
          ...shipping,
          items: { create: lineItems },
        },
        include: orderInclude,
      });
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
      return created;
    });

    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findById(id);
    await this.prisma.order.update({ where: { id }, data: dto });
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.order.delete({ where: { id } });
    return { success: true };
  }
}
