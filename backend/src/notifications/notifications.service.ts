import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/notification.dto';

type DbClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Emit a notification. Accepts a tx client so it can ride an existing tx. */
  create(
    client: DbClient,
    type: NotificationType,
    meta: Record<string, unknown>,
    link?: string,
  ) {
    return client.notification.create({
      data: { type, link, meta: meta as Prisma.InputJsonValue },
    });
  }

  async list(query: ListNotificationsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.NotificationWhereInput =
      query.unreadOnly === 'true' ? { isRead: false } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.notification.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  async unreadCount() {
    const count = await this.prisma.notification.count({ where: { isRead: false } });
    return { count };
  }

  async markRead(id: string) {
    await this.prisma.notification.updateMany({ where: { id }, data: { isRead: true } });
    return { success: true };
  }

  async markAllRead() {
    await this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
