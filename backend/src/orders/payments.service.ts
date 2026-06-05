import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderEventType, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { OrderEventsService } from './order-events.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private events: OrderEventsService,
  ) {}

  private async ensureOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
  }

  // A payment marked PAID should carry a timestamp; default it to now when the
  // caller didn't supply one.
  private resolvePaidAt(
    status: PaymentStatus | undefined,
    paidAt: string | undefined,
  ): Date | null | undefined {
    if (paidAt) return new Date(paidAt);
    if (status === 'PAID') return new Date();
    return undefined;
  }

  async list(orderId: string) {
    await this.ensureOrder(orderId);
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(orderId: string, dto: CreatePaymentDto) {
    await this.ensureOrder(orderId);
    const data: Prisma.PaymentUncheckedCreateInput = {
      orderId,
      method: dto.method,
      amountCents: dto.amountCents,
      status: dto.status ?? 'PENDING',
      reference: dto.reference,
      note: dto.note,
      paidAt: this.resolvePaidAt(dto.status, dto.paidAt) ?? null,
    };
    const payment = await this.prisma.payment.create({ data });
    await this.events.record(this.prisma, orderId, OrderEventType.PAYMENT_RECORDED, {
      amountCents: payment.amountCents,
      method: payment.method,
      status: payment.status,
    });
    return payment;
  }

  async update(orderId: string, id: string, dto: UpdatePaymentDto) {
    await this.findOwned(orderId, id);
    const data: Prisma.PaymentUpdateInput = {
      method: dto.method,
      amountCents: dto.amountCents,
      status: dto.status,
      reference: dto.reference,
      note: dto.note,
    };
    const paidAt = this.resolvePaidAt(dto.status, dto.paidAt);
    if (paidAt !== undefined) data.paidAt = paidAt;
    const payment = await this.prisma.payment.update({ where: { id }, data });
    await this.events.record(this.prisma, orderId, OrderEventType.PAYMENT_UPDATED, {
      amountCents: payment.amountCents,
      method: payment.method,
      status: payment.status,
    });
    return payment;
  }

  async remove(orderId: string, id: string) {
    const payment = await this.findOwned(orderId, id);
    await this.prisma.payment.delete({ where: { id } });
    await this.events.record(this.prisma, orderId, OrderEventType.PAYMENT_REMOVED, {
      amountCents: payment.amountCents,
      method: payment.method,
    });
    return { success: true };
  }

  private async findOwned(orderId: string, id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.orderId !== orderId) {
      throw new NotFoundException(`Payment ${id} not found on order ${orderId}`);
    }
    return payment;
  }
}
