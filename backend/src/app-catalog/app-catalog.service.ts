import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Lang, pick, toLang } from '../common/i18n';
import { PrismaService } from '../prisma/prisma.service';
import { AppProductQueryDto } from './dto/app-product-query.dto';

const PRODUCT_ORDER_BY: Record<string, Prisma.ProductOrderByWithRelationInput> =
  {
    newest: { createdAt: 'desc' },
    price_asc: { priceCents: 'asc' },
    price_desc: { priceCents: 'desc' },
    rating: { ratingAvg: 'desc' },
  };

// Minimal storefront fields needed by a product card.
const cardSelect = {
  id: true,
  name: true,
  nameAr: true,
  nameCkb: true,
  priceCents: true,
  salePriceCents: true,
  currency: true,
  imageUrl: true,
  ratingAvg: true,
  ratingCount: true,
  store: { select: { name: true, nameAr: true, nameCkb: true } },
} as const;

type ProductCardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

/**
 * Storefront catalog reads for the mobile app: product detail (resolved to one
 * language, with the customer's favorite state) and the customer's favorites.
 * Scoped to the authenticated customer.
 */
@Injectable()
export class AppCatalogService {
  constructor(private prisma: PrismaService) {}

  async productDetail(customerId: string, id: string, lang: Lang) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        store: { select: { id: true, name: true, nameAr: true, nameCkb: true } },
        category: { select: { id: true, name: true, nameAr: true, nameCkb: true } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const favorite = await this.prisma.favorite.findUnique({
      where: { customerId_productId: { customerId, productId: id } },
      select: { id: true },
    });

    return {
      id: product.id,
      name: pick(lang, product.name, product.nameAr, product.nameCkb),
      description: pick(
        lang,
        product.description,
        product.descriptionAr,
        product.descriptionCkb,
      ),
      priceCents: product.priceCents,
      salePriceCents: product.salePriceCents,
      currency: product.currency,
      imageUrl: product.imageUrl,
      images: product.images,
      stock: product.stock,
      inStock: product.stock > 0,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      attributes: product.attributes,
      store: {
        id: product.store.id,
        name: pick(
          lang,
          product.store.name,
          product.store.nameAr,
          product.store.nameCkb,
        ),
      },
      category: product.category
        ? {
            id: product.category.id,
            name: pick(
              lang,
              product.category.name,
              product.category.nameAr,
              product.category.nameCkb,
            ),
          }
        : null,
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        priceCents: v.priceCents,
        salePriceCents: v.salePriceCents,
        stock: v.stock,
        inStock: v.stock > 0,
        imageUrl: v.imageUrl,
      })),
      isFavorite: !!favorite,
    };
  }

  async listFavorites(customerId: string, lang: Lang) {
    const favorites = await this.prisma.favorite.findMany({
      where: { customerId, product: { isActive: true } },
      orderBy: { createdAt: 'desc' },
      include: {
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
            ratingAvg: true,
            ratingCount: true,
            store: { select: { name: true, nameAr: true, nameCkb: true } },
          },
        },
      },
    });
    return favorites.map((f) => ({
      id: f.product.id,
      name: pick(lang, f.product.name, f.product.nameAr, f.product.nameCkb),
      priceCents: f.product.priceCents,
      salePriceCents: f.product.salePriceCents,
      currency: f.product.currency,
      imageUrl: f.product.imageUrl,
      ratingAvg: f.product.ratingAvg,
      ratingCount: f.product.ratingCount,
      storeName: pick(
        lang,
        f.product.store.name,
        f.product.store.nameAr,
        f.product.store.nameCkb,
      ),
    }));
  }

  async addFavorite(customerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    // Idempotent: a repeated tap is a no-op, not a 409.
    await this.prisma.favorite.upsert({
      where: { customerId_productId: { customerId, productId } },
      create: { customerId, productId },
      update: {},
    });
    return { isFavorite: true };
  }

  async removeFavorite(customerId: string, productId: string) {
    await this.prisma.favorite.deleteMany({ where: { customerId, productId } });
    return { isFavorite: false };
  }

  // ---- Browse / search ----

  async listProducts(q: AppProductQueryDto) {
    const lang = toLang(q.lang);
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;

    const where: Prisma.ProductWhereInput = { isActive: true };
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { nameAr: { contains: q.search, mode: 'insensitive' } },
        { nameCkb: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.storeId) where.storeId = q.storeId;
    if (q.minPrice != null || q.maxPrice != null) {
      where.priceCents = {
        ...(q.minPrice != null ? { gte: q.minPrice } : {}),
        ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
      };
    }
    if (q.inStock === 'true') where.stock = { gt: 0 };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        select: cardSelect,
        orderBy: PRODUCT_ORDER_BY[q.sort ?? 'newest'],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map((p) => this.shapeCard(p, lang)),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async listStores(lang: Lang) {
    const stores = await this.prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        nameAr: true,
        nameCkb: true,
        description: true,
        descriptionAr: true,
        descriptionCkb: true,
        logoUrl: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    return stores.map((s) => ({
      id: s.id,
      name: pick(lang, s.name, s.nameAr, s.nameCkb),
      description: pick(lang, s.description, s.descriptionAr, s.descriptionCkb),
      logoUrl: s.logoUrl,
      productCount: s._count.products,
    }));
  }

  async storeDetail(id: string, lang: Lang) {
    const store = await this.prisma.store.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        nameCkb: true,
        description: true,
        descriptionAr: true,
        descriptionCkb: true,
        logoUrl: true,
        products: {
          where: { isActive: true },
          select: cardSelect,
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });
    if (!store) throw new NotFoundException('Store not found');
    return {
      id: store.id,
      name: pick(lang, store.name, store.nameAr, store.nameCkb),
      description: pick(
        lang,
        store.description,
        store.descriptionAr,
        store.descriptionCkb,
      ),
      logoUrl: store.logoUrl,
      productCount: store.products.length,
      products: store.products.map((p) => this.shapeCard(p, lang)),
    };
  }

  async listCategories(lang: Lang) {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        nameAr: true,
        nameCkb: true,
        imageUrl: true,
      },
    });
    return categories.map((c) => ({
      id: c.id,
      name: pick(lang, c.name, c.nameAr, c.nameCkb),
      imageUrl: c.imageUrl,
    }));
  }

  private shapeCard(p: ProductCardRow, lang: Lang) {
    return {
      id: p.id,
      name: pick(lang, p.name, p.nameAr, p.nameCkb),
      priceCents: p.priceCents,
      salePriceCents: p.salePriceCents,
      currency: p.currency,
      imageUrl: p.imageUrl,
      storeName: pick(lang, p.store.name, p.store.nameAr, p.store.nameCkb),
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
    };
  }
}
