import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const EXCLUDED_FROM_REVENUE: OrderStatus[] = ['CANCELLED', 'REFUNDED'];
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 60;

export interface DateRange {
  start?: string;
  end?: string;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /** Resolve an optional ISO range to concrete day-aligned bounds (defaults: last 60 days). */
  private resolveRange({ start, end }: DateRange = {}) {
    const endDate = end ? new Date(end) : new Date();
    if (Number.isNaN(endDate.getTime())) endDate.setTime(Date.now());
    endDate.setHours(23, 59, 59, 999);

    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
    if (Number.isNaN(startDate.getTime())) {
      startDate.setTime(endDate.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);
    }
    startDate.setHours(0, 0, 0, 0);

    return { start: startDate, end: endDate };
  }

  async summary(range?: DateRange) {
    const { start, end } = this.resolveRange(range);
    const placedAt = { gte: start, lte: end };

    const [revenueAgg, ordersByStatus, customerCount, productCount] = await Promise.all([
      this.prisma.order.aggregate({
        // Revenue is merchandise + shipping the business keeps; tax and
        // fee-group charges (e.g. transportation) are pass-through, not revenue.
        _sum: { totalCents: true, taxCents: true, feesCents: true },
        _count: { _all: true },
        where: { status: { notIn: EXCLUDED_FROM_REVENUE }, placedAt },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { placedAt },
      }),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    const revenueCents =
      (revenueAgg._sum.totalCents ?? 0) -
      (revenueAgg._sum.taxCents ?? 0) -
      (revenueAgg._sum.feesCents ?? 0);
    const orderCount = revenueAgg._count._all;
    const aovCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;

    return {
      revenueCents,
      orderCount,
      aovCents,
      customerCount,
      productCount,
      range: { start: start.toISOString(), end: end.toISOString() },
      ordersByStatus: ordersByStatus
        .map((g) => ({ status: g.status, count: g._count._all }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /** One row per day across the range: order count + revenue (excludes cancelled/refunded). */
  async timeseries(range?: DateRange) {
    const { start, end } = this.resolveRange(range);

    const rows = await this.prisma.$queryRaw<
      { date: string; orders: bigint; revenue: bigint }[]
    >(Prisma.sql`
      SELECT to_char(gs.day::date, 'YYYY-MM-DD') AS date,
             COUNT(o.id)::bigint AS orders,
             COALESCE(SUM(
               CASE WHEN o.status NOT IN ('CANCELLED', 'REFUNDED')
                    THEN o."totalCents" - o."taxCents" - o."feesCents" ELSE 0 END
             ), 0)::bigint AS revenue
      FROM generate_series(${start}::date, ${end}::date, interval '1 day') AS gs(day)
      LEFT JOIN "Order" o ON o."placedAt"::date = gs.day::date
      GROUP BY gs.day
      ORDER BY gs.day
    `);

    return rows.map((r) => ({
      date: r.date,
      orders: Number(r.orders),
      revenueCents: Number(r.revenue),
    }));
  }

  async topProducts(limit = 10, range?: DateRange) {
    const { start, end } = this.resolveRange(range);

    const rows = await this.prisma.$queryRaw<
      { productId: string; revenue: bigint; units: bigint }[]
    >(Prisma.sql`
      SELECT oi."productId",
             SUM(oi.quantity * oi."priceCents")::bigint AS revenue,
             SUM(oi.quantity)::bigint AS units
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status NOT IN ('CANCELLED', 'REFUNDED')
        AND o."placedAt" BETWEEN ${start} AND ${end}
      GROUP BY oi."productId"
      ORDER BY revenue DESC
      LIMIT ${limit}
    `);

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
