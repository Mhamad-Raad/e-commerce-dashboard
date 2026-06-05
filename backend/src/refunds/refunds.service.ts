import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderEventType,
  Prisma,
  RefundStatus,
  StockMovementReason,
} from '@prisma/client';
import { CSV_MAX_ROWS, toCsv } from '../common/csv';
import { buildPaginated, paginate } from '../common/pagination';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OrderEventsService } from '../orders/order-events.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRefundDto,
  ListRefundsQueryDto,
  UpdateRefundDto,
} from './dto/refund.dto';

const refundInclude = {
  items: true,
  order: {
    select: {
      id: true,
      number: true,
      totalCents: true,
      currency: true,
      customer: { select: { id: true, name: true, email: true } },
    },
  },
};

// Allowed status transitions; terminal states have no outgoing moves.
const TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  REQUESTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'REJECTED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

// A refund still "claims" items unless it was rejected/cancelled.
const ACTIVE_REFUND_STATUSES: RefundStatus[] = [
  'REQUESTED',
  'APPROVED',
  'COMPLETED',
];

const generateRefundNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RMA-${ts}-${rand}`;
};

@Injectable()
export class RefundsService {
  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService,
    private events: OrderEventsService,
    private notifications: NotificationsService,
  ) {}

  private listWhere(query: ListRefundsQueryDto): Prisma.RefundWhereInput {
    const where: Prisma.RefundWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.orderId) where.orderId = query.orderId;
    if (query.search) {
      where.OR = [
        { number: { contains: query.search, mode: 'insensitive' } },
        { order: { number: { contains: query.search, mode: 'insensitive' } } },
        { order: { customer: { name: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }
    return where;
  }

  async list(query: ListRefundsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.listWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.refund.findMany({
        where,
        include: refundInclude,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.refund.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: refundInclude,
    });
    if (!refund) throw new NotFoundException(`Refund ${id} not found`);
    return refund;
  }

  async exportCsv(query: ListRefundsQueryDto) {
    const where = this.listWhere(query);

    const refunds = await this.prisma.refund.findMany({
      where,
      include: { order: { select: { number: true, customer: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: CSV_MAX_ROWS,
    });

    return toCsv(refunds, [
      { header: 'Number', value: (r) => r.number },
      { header: 'Order', value: (r) => r.order.number },
      { header: 'Customer', value: (r) => r.order.customer.name },
      { header: 'Reason', value: (r) => r.reason },
      { header: 'Status', value: (r) => r.status },
      { header: 'Amount', value: (r) => r.amountCents },
      { header: 'Currency', value: (r) => r.currency },
      { header: 'Restock', value: (r) => (r.restock ? 'yes' : 'no') },
      { header: 'Created', value: (r) => r.createdAt.toISOString() },
      { header: 'Resolved', value: (r) => r.resolvedAt?.toISOString() ?? '' },
    ]);
  }

  /** Quantity already claimed per order item by non-rejected refunds. */
  private async claimedQuantities(
    client: PrismaService | Prisma.TransactionClient,
    orderId: string,
  ): Promise<Map<string, number>> {
    const claimed = await client.refundItem.groupBy({
      by: ['orderItemId'],
      _sum: { quantity: true },
      where: { refund: { orderId, status: { in: ACTIVE_REFUND_STATUSES } } },
    });
    return new Map(claimed.map((c) => [c.orderItemId, c._sum.quantity ?? 0]));
  }

  /** Per-order-item refundable quantities (ordered minus already-claimed). */
  async refundableForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { orderBy: { id: 'asc' } } },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const claimedMap = await this.claimedQuantities(this.prisma, orderId);

    return {
      orderId: order.id,
      number: order.number,
      currency: order.currency,
      items: order.items.map((it) => {
        const refunded = claimedMap.get(it.id) ?? 0;
        return {
          orderItemId: it.id,
          productId: it.productId,
          variantId: it.variantId,
          name: it.name,
          variantName: it.variantName,
          sku: it.sku,
          priceCents: it.priceCents,
          orderedQuantity: it.quantity,
          refundedQuantity: refunded,
          refundableQuantity: Math.max(0, it.quantity - refunded),
        };
      }),
    };
  }

  async create(dto: CreateRefundDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true, customer: { select: { name: true } } },
    });
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot refund a cancelled order');
    }

    const orderItemMap = new Map(order.items.map((it) => [it.id, it]));

    return this.prisma.$transaction(async (tx) => {
      // Serialize refunds for this order: the row lock makes the remaining-qty
      // read and the insert atomic against concurrent refund requests (closes
      // the check-then-insert over-refund race).
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${dto.orderId} FOR UPDATE`;

      const claimedMap = await this.claimedQuantities(tx, dto.orderId);
      const lines = dto.items.map((input) => {
        const orderItem = orderItemMap.get(input.orderItemId);
        if (!orderItem) {
          throw new BadRequestException(
            `Item ${input.orderItemId} does not belong to this order`,
          );
        }
        const remaining = Math.max(
          0,
          orderItem.quantity - (claimedMap.get(input.orderItemId) ?? 0),
        );
        if (input.quantity > remaining) {
          throw new BadRequestException(
            `Only ${remaining} of "${orderItem.name}" remain refundable`,
          );
        }
        return {
          orderItemId: orderItem.id,
          productId: orderItem.productId,
          variantId: orderItem.variantId,
          name: orderItem.name,
          variantName: orderItem.variantName,
          quantity: input.quantity,
          priceCents: orderItem.priceCents,
        };
      });

      const computed = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
      const amountCents = dto.amountCents ?? computed;

      const created = await tx.refund.create({
        data: {
          number: generateRefundNumber(),
          orderId: dto.orderId,
          reason: dto.reason,
          note: dto.note,
          restock: dto.restock ?? true,
          amountCents,
          currency: order.currency,
          items: { create: lines },
        },
        include: refundInclude,
      });
      await this.events.record(tx, dto.orderId, OrderEventType.REFUND_REQUESTED, {
        number: created.number,
        amountCents,
        reason: dto.reason,
      });
      await this.notifications.create(
        tx,
        'REFUND_REQUESTED',
        {
          number: created.number,
          orderNumber: order.number,
          customerName: order.customer.name,
          amountCents,
          currency: order.currency,
        },
        `/refunds/${created.id}`,
      );
      return created;
    });
  }

  async update(id: string, dto: UpdateRefundDto) {
    await this.prisma.$transaction(async (tx) => {
      // Lock the refund row and re-read it inside the tx so a concurrent
      // complete can't double-restock (the second sees status already COMPLETED).
      await tx.$queryRaw`SELECT id FROM "Refund" WHERE id = ${id} FOR UPDATE`;
      const existing = await tx.refund.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new NotFoundException(`Refund ${id} not found`);

      // Field edits are only allowed before the refund leaves REQUESTED.
      const editsRequested =
        dto.reason !== undefined ||
        dto.note !== undefined ||
        dto.restock !== undefined ||
        dto.amountCents !== undefined;
      if (editsRequested && existing.status !== 'REQUESTED') {
        throw new BadRequestException(
          'A refund can only be edited while it is still requested',
        );
      }

      const targetStatus = dto.status;
      if (targetStatus && targetStatus !== existing.status) {
        if (!TRANSITIONS[existing.status].includes(targetStatus)) {
          throw new BadRequestException(
            `Cannot move a refund from ${existing.status} to ${targetStatus}`,
          );
        }
      }

      await tx.refund.update({
        where: { id },
        data: {
          reason: dto.reason,
          note: dto.note,
          restock: dto.restock,
          amountCents: dto.amountCents,
          status: targetStatus,
          ...(targetStatus && targetStatus !== existing.status && targetStatus !== 'APPROVED'
            ? { resolvedAt: new Date() }
            : {}),
        },
      });

      // Completing a refund optionally returns the items to inventory and marks
      // the order timeline.
      if (targetStatus === 'COMPLETED' && existing.status !== 'COMPLETED') {
        if (existing.restock) {
          for (const it of existing.items) {
            await this.inventory.applyChange(
              tx,
              { productId: it.productId, variantId: it.variantId },
              it.quantity,
              StockMovementReason.RETURN,
              { orderId: existing.orderId, note: `Refund ${existing.number}` },
            );
          }
        }
        await this.events.record(tx, existing.orderId, OrderEventType.REFUND_COMPLETED, {
          number: existing.number,
          amountCents: existing.amountCents,
          restocked: existing.restock,
        });
      }
    });

    return this.findById(id);
  }

  async remove(id: string) {
    const refund = await this.findById(id);
    if (refund.status === 'COMPLETED') {
      throw new BadRequestException(
        'A completed refund cannot be deleted; it is part of the order history',
      );
    }
    await this.prisma.refund.delete({ where: { id } });
    return { success: true };
  }
}
