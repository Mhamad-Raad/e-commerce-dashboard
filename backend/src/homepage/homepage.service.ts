import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class HomepageService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  /** Composed payload that drives the storefront landing page. */
  async getHomepage() {
    const [banners, featuredProducts, featuredCategories, featuredStores] =
      await this.prisma.$transaction([
        this.prisma.heroBanner.findMany({ orderBy: { sortOrder: 'asc' } }),
        this.prisma.featuredProduct.findMany({
          orderBy: { sortOrder: 'asc' },
          include: { product: { include: { store: true, category: true } } },
        }),
        this.prisma.featuredCategory.findMany({
          orderBy: { sortOrder: 'asc' },
          include: { category: { include: { _count: { select: { products: true } } } } },
        }),
        this.prisma.featuredStore.findMany({
          orderBy: { sortOrder: 'asc' },
          include: { store: { include: { _count: { select: { products: true } } } } },
        }),
      ]);

    return {
      banners,
      featuredProducts: featuredProducts.map((f) => f.product),
      featuredCategories: featuredCategories.map((f) => f.category),
      featuredStores: featuredStores.map((f) => f.store),
    };
  }

  // ---- Hero banners ----

  listBanners() {
    return this.prisma.heroBanner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  createBanner(dto: CreateBannerDto) {
    return this.prisma.heroBanner.create({ data: dto });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const existing = await this.ensureBanner(id);
    const updated = await this.prisma.heroBanner.update({ where: { id }, data: dto });
    if (dto.imageUrl !== undefined && existing.imageUrl !== updated.imageUrl) {
      await this.uploads.deleteByUrl(existing.imageUrl);
    }
    return updated;
  }

  async removeBanner(id: string) {
    const existing = await this.ensureBanner(id);
    await this.prisma.heroBanner.delete({ where: { id } });
    await this.uploads.deleteByUrl(existing.imageUrl);
    return { success: true };
  }

  private async ensureBanner(id: string) {
    const banner = await this.prisma.heroBanner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner ${id} not found`);
    return banner;
  }

  // ---- Featured sets (ordered replace) ----

  async setFeaturedProducts(ids: string[]) {
    await this.assertAllExist(
      ids,
      (xs) => this.prisma.product.count({ where: { id: { in: xs } } }),
      'product',
    );
    await this.prisma.$transaction([
      this.prisma.featuredProduct.deleteMany(),
      this.prisma.featuredProduct.createMany({
        data: ids.map((productId, i) => ({ productId, sortOrder: i })),
      }),
    ]);
    return this.getHomepage().then((h) => h.featuredProducts);
  }

  async setFeaturedCategories(ids: string[]) {
    await this.assertAllExist(
      ids,
      (xs) => this.prisma.category.count({ where: { id: { in: xs } } }),
      'category',
    );
    await this.prisma.$transaction([
      this.prisma.featuredCategory.deleteMany(),
      this.prisma.featuredCategory.createMany({
        data: ids.map((categoryId, i) => ({ categoryId, sortOrder: i })),
      }),
    ]);
    return this.getHomepage().then((h) => h.featuredCategories);
  }

  async setFeaturedStores(ids: string[]) {
    await this.assertAllExist(
      ids,
      (xs) => this.prisma.store.count({ where: { id: { in: xs } } }),
      'store',
    );
    await this.prisma.$transaction([
      this.prisma.featuredStore.deleteMany(),
      this.prisma.featuredStore.createMany({
        data: ids.map((storeId, i) => ({ storeId, sortOrder: i })),
      }),
    ]);
    return this.getHomepage().then((h) => h.featuredStores);
  }

  private async assertAllExist(
    ids: string[],
    counter: (ids: string[]) => Promise<number>,
    label: string,
  ) {
    if (ids.length === 0) return;
    const found = await counter(ids);
    if (found !== new Set(ids).size) {
      throw new BadRequestException(`One or more ${label} ids do not exist`);
    }
  }
}
