import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HomeTargetType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { HomeSectionItemDto } from './dto/section-item.dto';
import { ReorderEntryDto } from './dto/reorder-sections.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

// Resolve each item's target to the minimal fields the storefront needs.
const ITEM_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      priceCents: true,
      salePriceCents: true,
      currency: true,
      imageUrl: true,
      store: { select: { name: true } },
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: true } },
    },
  },
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      _count: { select: { products: true } },
    },
  },
  blogPost: {
    select: {
      id: true,
      titleEn: true,
      titleAr: true,
      excerptEn: true,
      excerptAr: true,
      coverImage: true,
    },
  },
} satisfies Prisma.HomeSectionItemInclude;

// Which id a target type requires. NONE needs nothing.
const REQUIRED_FIELD: Record<HomeTargetType, keyof HomeSectionItemDto | null> = {
  NONE: null,
  PRODUCT: 'productId',
  CATEGORY: 'categoryId',
  STORE: 'storeId',
  BLOG: 'blogPostId',
  URL: 'url',
};

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  // ── Public storefront layout ───────────────────────────────────────────────
  async getLayout() {
    const sections = await this.prisma.homeSection.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: {
        items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE },
      },
    });
    return sections.map((s) => this.shapeSection(s));
  }

  // ── Admin builder ──────────────────────────────────────────────────────────
  async listSections() {
    const sections = await this.prisma.homeSection.findMany({
      orderBy: { position: 'asc' },
      include: {
        items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE },
      },
    });
    return sections.map((s) => this.shapeSection(s));
  }

  async createSection(dto: CreateSectionDto) {
    const items = (dto.items ?? []).map((it, i) => this.mapItem(it, i));
    await this.validateRefs(items);
    // New sections go to the end.
    const max = await this.prisma.homeSection.aggregate({
      _max: { position: true },
    });
    const section = await this.prisma.homeSection.create({
      data: {
        type: dto.type,
        isActive: dto.isActive ?? true,
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        position: (max._max.position ?? -1) + 1,
        items: { create: items },
      },
      include: { items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE } },
    });
    return this.shapeSection(section);
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    await this.ensureSection(id);
    const mapped = dto.items?.map((it, i) => this.mapItem(it, i));
    if (mapped) await this.validateRefs(mapped);

    const section = await this.prisma.$transaction(async (tx) => {
      await tx.homeSection.update({
        where: { id },
        data: {
          isActive: dto.isActive,
          titleEn: dto.titleEn,
          titleAr: dto.titleAr,
          config: dto.config as Prisma.InputJsonValue | undefined,
        },
      });
      // Full replace of items when provided.
      if (mapped) {
        await tx.homeSectionItem.deleteMany({ where: { sectionId: id } });
        if (mapped.length) {
          await tx.homeSectionItem.createMany({
            data: mapped.map((m) => ({ ...m, sectionId: id })),
          });
        }
      }
      return tx.homeSection.findUniqueOrThrow({
        where: { id },
        include: { items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE } },
      });
    });
    return this.shapeSection(section);
  }

  async reorder(entries: ReorderEntryDto[]) {
    await this.prisma.$transaction(
      entries.map((e) =>
        this.prisma.homeSection.update({
          where: { id: e.id },
          data: { position: e.position },
        }),
      ),
    );
    return { success: true };
  }

  async removeSection(id: string) {
    await this.ensureSection(id);
    await this.prisma.homeSection.delete({ where: { id } });
    return { success: true };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private async ensureSection(id: string) {
    const section = await this.prisma.homeSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  // Verify every referenced product/category/store/blog id exists, so a bad id
  // returns a clean 400 instead of a DB foreign-key 500.
  private async validateRefs(
    items: {
      productId: string | null;
      categoryId: string | null;
      storeId: string | null;
      blogPostId: string | null;
    }[],
  ) {
    const uniq = (vals: (string | null)[]) =>
      [...new Set(vals.filter((v): v is string => !!v))];

    const productIds = uniq(items.map((i) => i.productId));
    if (productIds.length &&
      (await this.prisma.product.count({ where: { id: { in: productIds } } })) !==
        productIds.length) {
      throw new BadRequestException('One or more productId values do not exist');
    }
    const categoryIds = uniq(items.map((i) => i.categoryId));
    if (categoryIds.length &&
      (await this.prisma.category.count({ where: { id: { in: categoryIds } } })) !==
        categoryIds.length) {
      throw new BadRequestException('One or more categoryId values do not exist');
    }
    const storeIds = uniq(items.map((i) => i.storeId));
    if (storeIds.length &&
      (await this.prisma.store.count({ where: { id: { in: storeIds } } })) !==
        storeIds.length) {
      throw new BadRequestException('One or more storeId values do not exist');
    }
    const blogIds = uniq(items.map((i) => i.blogPostId));
    if (blogIds.length &&
      (await this.prisma.blogPost.count({ where: { id: { in: blogIds } } })) !==
        blogIds.length) {
      throw new BadRequestException('One or more blogPostId values do not exist');
    }
  }

  // Normalize a DTO item to a single, validated target FK (others nulled).
  private mapItem(item: HomeSectionItemDto, index: number) {
    const required = REQUIRED_FIELD[item.targetType];
    if (required && !item[required]) {
      throw new BadRequestException(
        `targetType ${item.targetType} requires "${required}"`,
      );
    }
    return {
      position: item.position ?? index,
      imageUrl: item.imageUrl ?? null,
      label: item.label ?? null,
      subtitle: item.subtitle ?? null,
      badge: item.badge ?? null,
      ctaLabel: item.ctaLabel ?? null,
      targetType: item.targetType,
      productId: item.targetType === 'PRODUCT' ? item.productId! : null,
      categoryId: item.targetType === 'CATEGORY' ? item.categoryId! : null,
      storeId: item.targetType === 'STORE' ? item.storeId! : null,
      blogPostId: item.targetType === 'BLOG' ? item.blogPostId! : null,
      url: item.targetType === 'URL' ? item.url! : null,
    };
  }

  private shapeSection(section: SectionWithItems) {
    return {
      id: section.id,
      type: section.type,
      position: section.position,
      isActive: section.isActive,
      titleEn: section.titleEn,
      titleAr: section.titleAr,
      config: section.config,
      items: section.items.map((it) => this.shapeItem(it)),
    };
  }

  private shapeItem(item: SectionWithItems['items'][number]) {
    return {
      id: item.id,
      position: item.position,
      imageUrl: item.imageUrl,
      label: item.label,
      subtitle: item.subtitle,
      badge: item.badge,
      ctaLabel: item.ctaLabel,
      targetType: item.targetType,
      url: item.url ?? undefined,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            priceCents: item.product.priceCents,
            salePriceCents: item.product.salePriceCents,
            currency: item.product.currency,
            imageUrl: item.product.imageUrl,
            storeName: item.product.store?.name,
          }
        : undefined,
      category: item.category
        ? {
            id: item.category.id,
            name: item.category.name,
            slug: item.category.slug,
            imageUrl: item.category.imageUrl,
            productCount: item.category._count.products,
          }
        : undefined,
      store: item.store
        ? {
            id: item.store.id,
            name: item.store.name,
            slug: item.store.slug,
            logoUrl: item.store.logoUrl,
            productCount: item.store._count.products,
          }
        : undefined,
      blogPost: item.blogPost ?? undefined,
    };
  }
}

type SectionWithItems = Prisma.HomeSectionGetPayload<{
  include: { items: { include: typeof ITEM_INCLUDE } };
}>;
