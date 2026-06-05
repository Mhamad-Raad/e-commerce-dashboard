import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFeeGroupDto,
  ListFeeGroupsQueryDto,
  UpdateFeeGroupDto,
} from './dto/feegroup.dto';

export interface ResolvedFees {
  feesCents: number;
  taxCents: number;
  feesLabel: string | null;
}

@Injectable()
export class FeeGroupsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListFeeGroupsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.FeeGroupWhereInput = {};
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.feeGroup.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { stores: true, brands: true } } },
        ...paginate(page, pageSize),
      }),
      this.prisma.feeGroup.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const group = await this.prisma.feeGroup.findUnique({
      where: { id },
      include: { _count: { select: { stores: true, brands: true } } },
    });
    if (!group) throw new NotFoundException(`Fee group ${id} not found`);
    return group;
  }

  create(dto: CreateFeeGroupDto) {
    return this.prisma.feeGroup.create({ data: dto });
  }

  async update(id: string, dto: UpdateFeeGroupDto) {
    await this.findById(id);
    return this.prisma.feeGroup.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    // Store/Brand assignments clear via FK SetNull; existing orders keep their
    // snapshotted fees.
    await this.prisma.feeGroup.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Resolve the fees for an order from the fee groups assigned to its stores
   * and brands. Each distinct active group applies once: its flat fee is summed
   * into feesCents and its tax rate is applied to the subtotal. Labels of
   * fee-bearing groups are joined for display.
   */
  async resolveForOrder(
    storeIds: string[],
    brandIds: string[],
    subtotalCents: number,
  ): Promise<ResolvedFees> {
    const groupIds = new Set<string>();

    if (storeIds.length) {
      const stores = await this.prisma.store.findMany({
        where: { id: { in: storeIds }, feeGroupId: { not: null } },
        select: { feeGroupId: true },
      });
      stores.forEach((s) => s.feeGroupId && groupIds.add(s.feeGroupId));
    }
    if (brandIds.length) {
      const brands = await this.prisma.brand.findMany({
        where: { id: { in: brandIds }, feeGroupId: { not: null } },
        select: { feeGroupId: true },
      });
      brands.forEach((b) => b.feeGroupId && groupIds.add(b.feeGroupId));
    }
    if (groupIds.size === 0) return { feesCents: 0, taxCents: 0, feesLabel: null };

    const groups = await this.prisma.feeGroup.findMany({
      where: { id: { in: [...groupIds] }, isActive: true },
    });

    let feesCents = 0;
    let taxCents = 0;
    const labels: string[] = [];
    for (const g of groups) {
      feesCents += g.feeCents;
      taxCents += Math.round((subtotalCents * g.taxRatePct) / 100);
      if (g.feeCents > 0) labels.push(g.label);
    }
    return {
      feesCents,
      taxCents,
      feesLabel: labels.length ? [...new Set(labels)].join(', ') : null,
    };
  }
}
