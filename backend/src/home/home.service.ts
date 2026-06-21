import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HomeTargetType, Prisma } from '@prisma/client';
import { Lang, pick } from '../common/i18n';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { HomeSectionItemDto } from './dto/section-item.dto';
import { ReorderEntryDto } from './dto/reorder-sections.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

// Resolve each item's target. Selects all language columns so the public shape
// can pick one and the admin shape can edit all three.
const ITEM_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      nameAr: true,
      nameCkb: true,
      priceCents: true,
      salePriceCents: true,
      currency: true,
      imageUrl: true,
      store: { select: { name: true, nameAr: true, nameCkb: true } },
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      nameAr: true,
      nameCkb: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: true } },
    },
  },
  store: {
    select: {
      id: true,
      name: true,
      nameAr: true,
      nameCkb: true,
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
      titleCkb: true,
      excerptEn: true,
      excerptAr: true,
      excerptCkb: true,
      coverImage: true,
    },
  },
} satisfies Prisma.HomeSectionItemInclude;

type SectionWithItems = Prisma.HomeSectionGetPayload<{
  include: { items: { include: typeof ITEM_INCLUDE } };
}>;
type ItemWithTargets = SectionWithItems['items'][number];

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

  // ── Public storefront layout — resolved to one language ─────────────────────
  async getLayout(lang: Lang) {
    const sections = await this.prisma.homeSection.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: {
        items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE },
      },
    });
    return sections.map((s) => this.shapeForApp(s, lang));
  }

  // ── Admin builder — all three languages for editing ─────────────────────────
  async listSections() {
    const sections = await this.prisma.homeSection.findMany({
      orderBy: { position: 'asc' },
      include: {
        items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE },
      },
    });
    return sections.map((s) => this.shapeForAdmin(s));
  }

  async createSection(dto: CreateSectionDto) {
    const items = (dto.items ?? []).map((it, i) => this.mapItem(it, i));
    await this.validateRefs(items);
    const max = await this.prisma.homeSection.aggregate({
      _max: { position: true },
    });
    const section = await this.prisma.homeSection.create({
      data: {
        type: dto.type,
        isActive: dto.isActive ?? true,
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        titleCkb: dto.titleCkb,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        position: (max._max.position ?? -1) + 1,
        items: { create: items },
      },
      include: { items: { orderBy: { position: 'asc' }, include: ITEM_INCLUDE } },
    });
    return this.shapeForAdmin(section);
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
          titleCkb: dto.titleCkb,
          config: dto.config as Prisma.InputJsonValue | undefined,
        },
      });
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
    return this.shapeForAdmin(section);
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

  // ── Public shaping (resolved) ───────────────────────────────────────────────
  private shapeForApp(section: SectionWithItems, lang: Lang) {
    return {
      id: section.id,
      type: section.type,
      position: section.position,
      isActive: section.isActive,
      title: pick(lang, section.titleEn, section.titleAr, section.titleCkb),
      config: section.config,
      items: section.items.map((it) => this.shapeItemApp(it, lang)),
    };
  }

  private shapeItemApp(item: ItemWithTargets, lang: Lang) {
    return {
      id: item.id,
      position: item.position,
      imageUrl: item.imageUrl,
      label: pick(lang, item.label, item.labelAr, item.labelCkb),
      subtitle: pick(lang, item.subtitle, item.subtitleAr, item.subtitleCkb),
      badge: pick(lang, item.badge, item.badgeAr, item.badgeCkb),
      ctaLabel: pick(lang, item.ctaLabel, item.ctaLabelAr, item.ctaLabelCkb),
      targetType: item.targetType,
      url: item.url ?? undefined,
      product: item.product
        ? {
            id: item.product.id,
            name: pick(lang, item.product.name, item.product.nameAr, item.product.nameCkb),
            priceCents: item.product.priceCents,
            salePriceCents: item.product.salePriceCents,
            currency: item.product.currency,
            imageUrl: item.product.imageUrl,
            storeName: pick(
              lang,
              item.product.store?.name,
              item.product.store?.nameAr,
              item.product.store?.nameCkb,
            ),
          }
        : undefined,
      category: item.category
        ? {
            id: item.category.id,
            name: pick(lang, item.category.name, item.category.nameAr, item.category.nameCkb),
            slug: item.category.slug,
            imageUrl: item.category.imageUrl,
            productCount: item.category._count.products,
          }
        : undefined,
      store: item.store
        ? {
            id: item.store.id,
            name: pick(lang, item.store.name, item.store.nameAr, item.store.nameCkb),
            slug: item.store.slug,
            logoUrl: item.store.logoUrl,
            productCount: item.store._count.products,
          }
        : undefined,
      blogPost: item.blogPost
        ? {
            id: item.blogPost.id,
            title: pick(lang, item.blogPost.titleEn, item.blogPost.titleAr, item.blogPost.titleCkb),
            excerpt: pick(
              lang,
              item.blogPost.excerptEn,
              item.blogPost.excerptAr,
              item.blogPost.excerptCkb,
            ),
            coverImage: item.blogPost.coverImage,
          }
        : undefined,
    };
  }

  // ── Admin shaping (all languages) ───────────────────────────────────────────
  private shapeForAdmin(section: SectionWithItems) {
    return {
      id: section.id,
      type: section.type,
      position: section.position,
      isActive: section.isActive,
      titleEn: section.titleEn,
      titleAr: section.titleAr,
      titleCkb: section.titleCkb,
      config: section.config,
      items: section.items.map((it) => this.shapeItemAdmin(it)),
    };
  }

  private shapeItemAdmin(item: ItemWithTargets) {
    return {
      id: item.id,
      position: item.position,
      imageUrl: item.imageUrl,
      label: item.label,
      labelAr: item.labelAr,
      labelCkb: item.labelCkb,
      subtitle: item.subtitle,
      subtitleAr: item.subtitleAr,
      subtitleCkb: item.subtitleCkb,
      badge: item.badge,
      badgeAr: item.badgeAr,
      badgeCkb: item.badgeCkb,
      ctaLabel: item.ctaLabel,
      ctaLabelAr: item.ctaLabelAr,
      ctaLabelCkb: item.ctaLabelCkb,
      targetType: item.targetType,
      url: item.url ?? undefined,
      productId: item.productId,
      categoryId: item.categoryId,
      storeId: item.storeId,
      blogPostId: item.blogPostId,
      // English display label + image for the picker UI.
      product: item.product
        ? { id: item.product.id, name: item.product.name, imageUrl: item.product.imageUrl }
        : undefined,
      category: item.category
        ? { id: item.category.id, name: item.category.name, imageUrl: item.category.imageUrl }
        : undefined,
      store: item.store
        ? { id: item.store.id, name: item.store.name, imageUrl: item.store.logoUrl }
        : undefined,
      blogPost: item.blogPost
        ? { id: item.blogPost.id, name: item.blogPost.titleEn, imageUrl: item.blogPost.coverImage }
        : undefined,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private async ensureSection(id: string) {
    const section = await this.prisma.homeSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

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
      labelAr: item.labelAr ?? null,
      labelCkb: item.labelCkb ?? null,
      subtitle: item.subtitle ?? null,
      subtitleAr: item.subtitleAr ?? null,
      subtitleCkb: item.subtitleCkb ?? null,
      badge: item.badge ?? null,
      badgeAr: item.badgeAr ?? null,
      badgeCkb: item.badgeCkb ?? null,
      ctaLabel: item.ctaLabel ?? null,
      ctaLabelAr: item.ctaLabelAr ?? null,
      ctaLabelCkb: item.ctaLabelCkb ?? null,
      targetType: item.targetType,
      productId: item.targetType === 'PRODUCT' ? item.productId! : null,
      categoryId: item.targetType === 'CATEGORY' ? item.categoryId! : null,
      storeId: item.targetType === 'STORE' ? item.storeId! : null,
      blogPostId: item.targetType === 'BLOG' ? item.blogPostId! : null,
      url: item.targetType === 'URL' ? item.url! : null,
    };
  }

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
}
