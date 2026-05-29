import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const EXCLUDED_FROM_REVENUE: OrderStatus[] = ['CANCELLED', 'REFUNDED'];

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const [revenueAgg, ordersByStatus, customerCount, productCount] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { totalCents: true },
        _count: { _all: true },
        where: { status: { notIn: EXCLUDED_FROM_REVENUE } },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    const revenueCents = revenueAgg._sum.totalCents ?? 0;
    const orderCount = revenueAgg._count._all;
    const aovCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;

    return {
      revenueCents,
      orderCount,
      aovCents,
      customerCount,
      productCount,
      ordersByStatus: ordersByStatus
        .map((g) => ({ status: g.status, count: g._count._all }))
        .sort((a, b) => b.count - a.count),
    };
  }

  async topProducts(limit = 10) {
    const rows = await this.prisma.$queryRaw<
      { productId: string; revenue: bigint; units: bigint }[]
    >`
      SELECT oi."productId",
             SUM(oi.quantity * oi."priceCents")::bigint AS revenue,
             SUM(oi.quantity)::bigint AS units
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
      GROUP BY oi."productId"
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;

    if (rows.length === 0) return [];

    const products = await this.prisma.product.findMany({
      where: { id: { in: rows.map((r) => r.productId) } },
      select: { id: true, name: true, sku: true, currency: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return rows
      .map((r) => {
        const product = productMap.get(r.productId);
        if (!product) return null;
        return {
          productId: r.productId,
          name: product.name,
          sku: product.sku,
          currency: product.currency,
          revenueCents: Number(r.revenue),
          units: Number(r.units),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }

  async recentOrders(limit = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { placedAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
