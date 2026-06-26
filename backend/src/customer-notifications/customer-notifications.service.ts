import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomerNotificationType, Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { FcmService } from '../fcm/fcm.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListCustomerNotificationsQueryDto,
  RegisterDeviceDto,
} from './dto/customer-notification.dto';
import { renderPush } from './notification-content';

// Read notifications older than this are pruned daily so the table stays bounded.
const RETENTION_DAYS = 60;
// Devices silent this long are pruned (token almost certainly dead/reinstalled).
const DEVICE_STALE_DAYS = 90;

@Injectable()
export class CustomerNotificationsService {
  private readonly logger = new Logger(CustomerNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private fcm: FcmService,
  ) {}

  /**
   * Persist a customer notification AND fire a best-effort push to all the
   * customer's devices. Designed to be called AFTER the triggering transaction
   * commits (order placed / status changed) — it never throws, so a push/storage
   * hiccup can't fail the originating request.
   */
  async notify(
    customerId: string,
    type: CustomerNotificationType,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.customerNotification.create({
        data: { customerId, type, data: data as Prisma.InputJsonValue },
      });
    } catch (err) {
      this.logger.error(`Failed to store notification for ${customerId}: ${String(err)}`);
      // If we can't even store it, still attempt the push below.
    }

    if (!this.fcm.enabled) return;

    try {
      const devices = await this.prisma.customerDevice.findMany({
        where: { customerId },
        select: { token: true, locale: true },
      });
      if (devices.length === 0) return;

      // Group tokens by locale so each device gets tray text in its language.
      const byLocale = new Map<string, string[]>();
      for (const d of devices) {
        const list = byLocale.get(d.locale) ?? [];
        list.push(d.token);
        byLocale.set(d.locale, list);
      }

      const deadTokens: string[] = [];
      for (const [locale, tokens] of byLocale) {
        const payload = renderPush(type, data, locale);
        if (!payload) continue; // unsupported type — in-app row already stored
        const res = await this.fcm.sendToTokens(tokens, payload);
        deadTokens.push(...res.invalidTokens);
      }

      if (deadTokens.length > 0) {
        await this.prisma.customerDevice.deleteMany({
          where: { token: { in: deadTokens } },
        });
      }
    } catch (err) {
      this.logger.error(`Push dispatch failed for ${customerId}: ${String(err)}`);
    }
  }

  // ---- In-app notification centre (customer-scoped reads) ----

  async list(customerId: string, query: ListCustomerNotificationsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.CustomerNotificationWhereInput = {
      customerId,
      ...(query.unreadOnly === 'true' ? { isRead: false } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customerNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.customerNotification.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  async unreadCount(customerId: string) {
    const count = await this.prisma.customerNotification.count({
      where: { customerId, isRead: false },
    });
    return { count };
  }

  async markRead(customerId: string, id: string) {
    // Scoped to the customer so one customer can't mark another's row read.
    await this.prisma.customerNotification.updateMany({
      where: { id, customerId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllRead(customerId: string) {
    await this.prisma.customerNotification.updateMany({
      where: { customerId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  // ---- Device (push token) registration ----

  /**
   * Register or refresh an FCM device token for this customer. Upserts on the
   * unique token: if the token was previously bound to another customer (shared
   * phone, account switch) it is reassigned to the current one.
   */
  async registerDevice(customerId: string, dto: RegisterDeviceDto) {
    const locale = dto.locale ?? 'en';
    await this.prisma.customerDevice.upsert({
      where: { token: dto.token },
      create: {
        customerId,
        token: dto.token,
        platform: dto.platform,
        locale,
      },
      update: {
        customerId,
        platform: dto.platform,
        locale,
        lastSeenAt: new Date(),
      },
    });
    return { success: true };
  }

  /** Unregister a token (logout). Scoped so a customer only drops their own. */
  async unregisterDevice(customerId: string, token: string) {
    await this.prisma.customerDevice.deleteMany({
      where: { token, customerId },
    });
    return { success: true };
  }

  /** Daily sweep: drop old read notifications and long-silent devices. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async prune() {
    const notifCutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const deviceCutoff = new Date(Date.now() - DEVICE_STALE_DAYS * 24 * 60 * 60 * 1000);
    const [notifs, devices] = await this.prisma.$transaction([
      this.prisma.customerNotification.deleteMany({
        where: { isRead: true, createdAt: { lt: notifCutoff } },
      }),
      this.prisma.customerDevice.deleteMany({
        where: { lastSeenAt: { lt: deviceCutoff } },
      }),
    ]);
    if (notifs.count > 0 || devices.count > 0) {
      this.logger.log(
        `Pruned ${notifs.count} read notifications and ${devices.count} stale devices`,
      );
    }
  }
}
