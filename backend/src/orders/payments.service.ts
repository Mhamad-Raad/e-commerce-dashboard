import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.payment.create({ data });
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
    return this.prisma.payment.update({ where: { id }, data });
  }

  async remove(orderId: string, id: string) {
    await this.findOwned(orderId, id);
    await this.prisma.payment.delete({ where: { id } });
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
