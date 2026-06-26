import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HomeTargetType, Prisma } from '@prisma/client';
import { validateTarget } from '../common/notification-target';
import { buildPaginated, paginate } from '../common/pagination';
import { CustomerNotificationsService } from '../customer-notifications/customer-notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAnnouncementDto,
  ListAnnouncementsQueryDto,
} from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private notifications: CustomerNotificationsService,
  ) {}

  /** Admin history of sent announcements, newest first. */
  async list(query: ListAnnouncementsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.AnnouncementWhereInput = query.search
      ? { titleEn: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.announcement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        // A small preview of named recipients for the list (full count is stored).
        include: {
          recipients: {
            take: 3,
            include: { customer: { select: { id: true, name: true } } },
          },
        },
        ...paginate(page, pageSize),
      }),
      this.prisma.announcement.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  /**
   * Compose + send immediately. Validates the target, resolves the recipient
   * set (all active customers, or one), persists the announcement, then fans it
   * out to per-customer feed rows + push. The fan-out is awaited (push is a
   * no-op while FCM is unconfigured); revisit with a queue if the customer base
   * grows into the thousands.
   */
  async create(dto: CreateAnnouncementDto) {
    const targetType = dto.targetType ?? HomeTargetType.NONE;
    await validateTarget(this.prisma, targetType, dto.targetId, dto.url);

    const customerIds = await this.resolveRecipients(dto);
    if (customerIds.length === 0) {
      throw new BadRequestException('There are no customers to send this to.');
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        titleCkb: dto.titleCkb,
        bodyEn: dto.bodyEn,
        bodyAr: dto.bodyAr,
        bodyCkb: dto.bodyCkb,
        imageUrl: dto.imageUrl,
        targetType,
        // Only keep the id/url relevant to the chosen target type.
        targetId: isEntityTarget(targetType) ? dto.targetId : null,
        url: targetType === HomeTargetType.URL ? dto.url : null,
        audience: dto.audience,
        recipientCount: customerIds.length,
        // Record the explicitly chosen recipients (none for an ALL broadcast).
        recipients:
          dto.audience === 'SINGLE'
            ? { createMany: { data: customerIds.map((customerId) => ({ customerId })) } }
            : undefined,
      },
    });

    await this.notifications.dispatchAnnouncement(announcement, customerIds);
    return announcement;
  }

  async remove(id: string) {
    const exists = await this.prisma.announcement.count({ where: { id } });
    if (!exists) throw new NotFoundException('Announcement not found');
    // Cascades the per-customer feed rows out of every customer's notifications.
    await this.prisma.announcement.delete({ where: { id } });
    return { success: true };
  }

  private async resolveRecipients(dto: CreateAnnouncementDto): Promise<string[]> {
    if (dto.audience === 'SINGLE') {
      const ids = [...new Set(dto.customerIds ?? [])]; // de-dupe the selection
      if (ids.length === 0) {
        throw new BadRequestException('Select at least one customer.');
      }
      const found = await this.prisma.customer.count({ where: { id: { in: ids } } });
      if (found !== ids.length) {
        throw new BadRequestException('One or more selected customers no longer exist.');
      }
      return ids;
    }
    // Broadcast: every active customer.
    const customers = await this.prisma.customer.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    return customers.map((c) => c.id);
  }
}

const isEntityTarget = (t: HomeTargetType) =>
  t === HomeTargetType.PRODUCT ||
  t === HomeTargetType.CATEGORY ||
  t === HomeTargetType.STORE ||
  t === HomeTargetType.BLOG;
