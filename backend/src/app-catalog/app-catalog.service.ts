import { Injectable, NotFoundException } from '@nestjs/common';
import { Lang, pick } from '../common/i18n';
import { PrismaService } from '../prisma/prisma.service';

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
}
