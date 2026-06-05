import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { ListNotificationsQueryDto } from './dto/notification.dto';

type DbClient = PrismaService | Prisma.TransactionClient;

// Notifications older than this are pruned daily so the feed table stays bounded.
const RETENTION_DAYS = 60;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /** Emit a notification. Accepts a tx client so it can ride an existing tx. */
  create(
    client: DbClient,
    type: NotificationType,
    meta: Record<string, unknown>,
    link?: string,
    actorId?: string,
  ) {
    return client.notification.create({
      data: { type, link, actorId, meta: meta as Prisma.InputJsonValue },
    });
  }

  /** Daily retention sweep so the activity feed can't grow without bound. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async pruneOld() {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) this.logger.log(`Pruned ${count} notifications older than ${RETENTION_DAYS}d`);
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
