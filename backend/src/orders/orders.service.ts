import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders.query.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';

const orderInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: { orderBy: { id: 'asc' as const } },
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
      let priceCents = product.priceCents;
      if (i.variantId) {
        const variant = variantMap.get(i.variantId);
        if (!variant || variant.productId !== product.id) {
          throw new BadRequestException(
            `Variant ${i.variantId} does not belong to product ${product.name}`,
          );
        }
        variantId = variant.id;
        variantName = variant.name;
        priceCents = variant.priceCents;
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
    const totalCents = subtotalCents + taxCents + shippingCents;
    const currency = dto.currency ?? products[0]?.currency ?? 'IQD';

    const order = await this.prisma.order.create({
      data: {
        number: generateOrderNumber(),
        customerId: dto.customerId,
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        currency,
        items: { create: lineItems },
      },
      include: orderInclude,
    });

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findById(id);
    await this.prisma.order.update({ where: { id }, data: { status: dto.status } });
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.order.delete({ where: { id } });
    return { success: true };
  }
}
