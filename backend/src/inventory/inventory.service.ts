import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovementReason } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdjustStockDto,
  ListMovementsQueryDto,
  RestockDto,
} from './dto/inventory.dto';

/** A unit that holds stock: either a variant (when present) or the bare product. */
export interface StockTarget {
  productId: string;
  variantId?: string | null;
  /** Human label used only for "insufficient stock" error messages. */
  label?: string;
}

export interface LowStockRow {
  productId: string;
  productName: string;
  sku: string;
  variantId: string | null;
  variantName: string | null;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string | null;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Apply a signed stock change to one product/variant and record a movement,
   * inside the given transaction. Decrements are race-safe and rejected if they
   * would drive stock negative. Returns the resulting stock level.
   */
  async applyChange(
    tx: Prisma.TransactionClient,
    target: StockTarget,
    delta: number,
    reason: StockMovementReason,
    opts: { note?: string | null; orderId?: string | null } = {},
  ): Promise<number> {
    if (delta === 0) return this.currentStock(tx, target);

    const resultingStock = target.variantId
      ? await this.applyToVariant(tx, target.variantId, delta, target.label)
      : await this.applyToProduct(tx, target.productId, delta, target.label);

    await tx.stockMovement.create({
      data: {
        productId: target.productId,
        variantId: target.variantId ?? null,
        delta,
        resultingStock,
        reason,
        note: opts.note ?? null,
        orderId: opts.orderId ?? null,
      },
    });
    return resultingStock;
  }

  private async applyToProduct(
    tx: Prisma.TransactionClient,
    id: string,
    delta: number,
    label?: string,
  ): Promise<number> {
    // For decrements, guard atomically so concurrent orders can't oversell:
    // the WHERE stock>=|delta| and the decrement happen in one statement.
    const res = await tx.product.updateMany({
      where: delta < 0 ? { id, stock: { gte: -delta } } : { id },
      data: { stock: { increment: delta } },
    });
    const row = await tx.product.findUnique({ where: { id }, select: { stock: true } });
    if (!row) throw new NotFoundException(`Product ${id} not found`);
    if (res.count === 0) throw this.shortfall(row.stock, delta, label);
    return row.stock;
  }

  private async applyToVariant(
    tx: Prisma.TransactionClient,
    id: string,
    delta: number,
    label?: string,
  ): Promise<number> {
    const res = await tx.productVariant.updateMany({
      where: delta < 0 ? { id, stock: { gte: -delta } } : { id },
      data: { stock: { increment: delta } },
    });
    const row = await tx.productVariant.findUnique({ where: { id }, select: { stock: true } });
    if (!row) throw new NotFoundException(`Variant ${id} not found`);
    if (res.count === 0) throw this.shortfall(row.stock, delta, label);
    return row.stock;
  }

  private shortfall(available: number, delta: number, label?: string) {
    return new BadRequestException(
      `Insufficient stock${label ? ` for ${label}` : ''}: ${available} available, ${-delta} requested`,
    );
  }

  private async currentStock(tx: Prisma.TransactionClient, target: StockTarget) {
    if (target.variantId) {
      const v = await tx.productVariant.findUnique({
        where: { id: target.variantId },
        select: { stock: true },
      });
      return v?.stock ?? 0;
    }
    const p = await tx.product.findUnique({
      where: { id: target.productId },
      select: { stock: true },
    });
    return p?.stock ?? 0;
  }

  /**
   * Decrement stock for every line of an order (reservation). Throws on any
   * shortfall — used both when an order is created and when a cancelled order is
   * re-opened. The caller is responsible for tracking the reserved state
   * (Order.stockReserved) so this is never double-applied.
   */
  async reserveOrderStock(tx: Prisma.TransactionClient, orderId: string) {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const it of items) {
      const label = it.variantName ? `${it.name} (${it.variantName})` : it.name;
      await this.applyChange(
        tx,
        { productId: it.productId, variantId: it.variantId, label },
        -it.quantity,
        StockMovementReason.ORDER,
        { orderId },
      );
    }
  }

  /**
   * Return an order's reserved stock to inventory. Mirror of reserveOrderStock;
   * idempotency is the caller's responsibility via Order.stockReserved.
   */
  async releaseOrderStock(tx: Prisma.TransactionClient, orderId: string) {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const it of items) {
      await this.applyChange(
        tx,
        { productId: it.productId, variantId: it.variantId },
        it.quantity,
        StockMovementReason.ORDER_CANCELLED,
        { orderId },
      );
    }
  }

  async restock(dto: RestockDto) {
    await this.ensureTarget(dto.productId, dto.variantId);
    return this.prisma.$transaction((tx) =>
      this.applyChange(
        tx,
        { productId: dto.productId, variantId: dto.variantId },
        dto.quantity,
        StockMovementReason.RESTOCK,
        { note: dto.note },
      ).then((resultingStock) => ({ resultingStock })),
    );
  }

  async adjust(dto: AdjustStockDto) {
    await this.ensureTarget(dto.productId, dto.variantId);
    return this.prisma.$transaction((tx) =>
      this.applyChange(
        tx,
        { productId: dto.productId, variantId: dto.variantId, label: 'this item' },
        dto.delta,
        StockMovementReason.ADJUSTMENT,
        { note: dto.note },
      ).then((resultingStock) => ({ resultingStock })),
    );
  }

  async listMovements(query: ListMovementsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.StockMovementWhereInput = {};
    if (query.productId) where.productId = query.productId;
    if (query.variantId) where.variantId = query.variantId;
    if (query.orderId) where.orderId = query.orderId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          variant: { select: { id: true, name: true } },
          order: { select: { id: true, number: true } },
        },
        ...paginate(page, pageSize),
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  /** Active products/variants whose stock has fallen to/below their threshold. */
  async lowStock(): Promise<LowStockRow[]> {
    return this.prisma.$queryRaw<LowStockRow[]>`
      SELECT p.id AS "productId", p.name AS "productName", p.sku AS "sku",
             NULL AS "variantId", NULL AS "variantName",
             p.stock AS "stock", p."lowStockThreshold" AS "lowStockThreshold",
             p."imageUrl" AS "imageUrl"
      FROM "Product" p
      WHERE p."isActive" = true
        AND NOT EXISTS (
          SELECT 1 FROM "ProductVariant" v
          WHERE v."productId" = p.id AND v."isActive" = true
        )
        AND p.stock <= p."lowStockThreshold"
      UNION ALL
      SELECT v."productId", p.name AS "productName", v.sku AS "sku",
             v.id AS "variantId", v.name AS "variantName",
             v.stock AS "stock", v."lowStockThreshold" AS "lowStockThreshold",
             COALESCE(v."imageUrl", p."imageUrl") AS "imageUrl"
      FROM "ProductVariant" v
      JOIN "Product" p ON p.id = v."productId"
      WHERE v."isActive" = true AND p."isActive" = true
        AND v.stock <= v."lowStockThreshold"
      ORDER BY "stock" ASC
    `;
  }

  private async ensureTarget(productId: string, variantId?: string) {
    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { productId: true },
      });
      if (!variant || variant.productId !== productId) {
        throw new BadRequestException('Variant does not belong to this product');
      }
      return;
    }
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
  }
}
