import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CSV_MAX_ROWS, toCsv } from '../common/csv';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  private listWhere(query: ListProductsQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.storeId) where.storeId = query.storeId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    return where;
  }

  async list(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.listWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { store: true, category: true, _count: { select: { variants: true } } },
        ...paginate(page, pageSize),
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        category: true,
        variants: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async exportCsv(query: ListProductsQueryDto) {
    const where = this.listWhere(query);

    const products = await this.prisma.product.findMany({
      where,
      include: {
        store: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: CSV_MAX_ROWS,
    });

    return toCsv(products, [
      { header: 'Name', value: (p) => p.name },
      { header: 'SKU', value: (p) => p.sku },
      { header: 'Price', value: (p) => p.priceCents },
      { header: 'SalePrice', value: (p) => p.salePriceCents ?? '' },
      { header: 'Currency', value: (p) => p.currency },
      { header: 'Stock', value: (p) => p.stock },
      { header: 'LowStockThreshold', value: (p) => p.lowStockThreshold },
      { header: 'Store', value: (p) => p.store?.name ?? '' },
      { header: 'Category', value: (p) => p.category?.name ?? '' },
      { header: 'Active', value: (p) => (p.isActive ? 'yes' : 'no') },
      { header: 'Rating', value: (p) => p.ratingAvg },
    ]);
  }

  async create(dto: CreateProductDto) {
    this.assertLeadOverride(dto.minLeadDays, dto.maxLeadDays);
    try {
      return await this.prisma.product.create({
        data: dto,
        include: { store: true, category: true },
      });
    } catch (err) {
      throw this.translateError(err, dto.sku);
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findById(id);
    // A field left out of the payload keeps its current value.
    this.assertLeadOverride(
      dto.minLeadDays !== undefined ? dto.minLeadDays : existing.minLeadDays,
      dto.maxLeadDays !== undefined ? dto.maxLeadDays : existing.maxLeadDays,
    );
    let updated;
    try {
      updated = await this.prisma.product.update({
        where: { id },
        data: dto,
        include: { store: true, category: true },
      });
    } catch (err) {
      throw this.translateError(err, dto.sku);
    }
    // If the cover or gallery changed, remove any R2 objects no longer referenced.
    if (dto.imageUrl !== undefined || dto.images !== undefined) {
      await this.cleanupRemovedImages(
        [existing.imageUrl, ...existing.images],
        [updated.imageUrl, ...updated.images],
      );
    }
    return updated;
  }

  /**
   * Delete (best-effort) every old image URL that is not in the kept set, so a
   * replaced cover or a gallery image removed from the array doesn't orphan its
   * R2 object. Dedup-safe: a URL reused as cover + gallery is never deleted.
   */
  private async cleanupRemovedImages(
    oldUrls: (string | null)[],
    keepUrls: (string | null)[],
  ) {
    const keep = new Set(keepUrls.filter((u): u is string => !!u));
    for (const url of oldUrls) {
      if (url && !keep.has(url)) await this.uploads.deleteByUrl(url);
    }
  }

  // The per-product delivery window is an all-or-nothing override: provide both
  // bounds (and min <= max) to override the store's default, or leave both blank
  // to inherit it.
  private assertLeadOverride(
    min: number | null | undefined,
    max: number | null | undefined,
  ) {
    const hasMin = min != null;
    const hasMax = max != null;
    if (hasMin !== hasMax) {
      throw new BadRequestException(
        'Set both minimum and maximum delivery days, or leave both blank to inherit the store default',
      );
    }
    if (hasMin && hasMax && (min as number) > (max as number)) {
      throw new BadRequestException(
        'Minimum delivery days cannot be greater than maximum delivery days',
      );
    }
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    try {
      await this.prisma.product.delete({ where: { id } });
      // Clean up the cover, the gallery, and every variant image (best-effort).
      await this.cleanupRemovedImages(
        [
          existing.imageUrl,
          ...existing.images,
          ...existing.variants.map((v) => v.imageUrl),
        ],
        [],
      );
      return { success: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'This product is referenced by existing orders and cannot be deleted. Deactivate it instead.',
        );
      }
      throw err;
    }
  }

  private translateError(err: unknown, sku?: string) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return new ConflictException(`SKU "${sku}" already exists`);
      }
      if (err.code === 'P2003' || err.code === 'P2025') {
        return new BadRequestException(
          'The selected store or category does not exist',
        );
      }
    }
    return err;
  }
}

