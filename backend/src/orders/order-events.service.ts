import { Injectable } from '@nestjs/common';
import { OrderEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Either the base client or an active transaction client can record events. */
type DbClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class OrderEventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Append an entry to an order's timeline. Pass a transaction client when the
   * event is part of a larger atomic operation (e.g. order creation) so it rolls
   * back together.
   */
  record(
    client: DbClient,
    orderId: string,
    type: OrderEventType,
    meta?: Record<string, unknown>,
  ) {
    return client.orderEvent.create({
      data: { orderId, type, meta: (meta ?? undefined) as Prisma.InputJsonValue },
    });
  }

  list(orderId: string) {
    return this.prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
