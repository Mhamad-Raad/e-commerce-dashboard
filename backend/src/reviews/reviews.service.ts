import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMyReviewDto } from './dto/app-review.dto';
import {
  CreateReviewDto,
  ListReviewsQueryDto,
  UpdateReviewDto,
} from './dto/review.dto';

const reviewInclude = {
  product: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListReviewsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.ReviewWhereInput = {};
    if (query.approved !== undefined) where.isApproved = query.approved === 'true';
    if (query.productId) where.productId = query.productId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { comment: { contains: query.search, mode: 'insensitive' } },
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.review.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  async listForProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: reviewInclude,
    });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  // Keep Product.ratingAvg/ratingCount (read by the storefront, catalog sort,
  // and the AI assistant) in sync with approved reviews.
  private async recomputeProductRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
  }

  async create(dto: CreateReviewDto) {
    try {
      const review = await this.prisma.review.create({
        data: {
          productId: dto.productId,
          customerId: dto.customerId,
          rating: dto.rating,
          title: dto.title,
          comment: dto.comment,
          isApproved: dto.isApproved ?? false,
        },
        include: reviewInclude,
      });
      await this.recomputeProductRating(review.productId);
      return review;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('This customer has already reviewed this product');
        }
        if (err.code === 'P2003') {
          throw new BadRequestException('Product or customer not found');
        }
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateReviewDto) {
    await this.findById(id);
    const review = await this.prisma.review.update({
      where: { id },
      data: dto,
      include: reviewInclude,
    });
    // rating or approval may have changed → refresh the denormalized aggregate.
    await this.recomputeProductRating(review.productId);
    return review;
  }

  async remove(id: string) {
    const review = await this.findById(id);
    await this.prisma.review.delete({ where: { id } });
    await this.recomputeProductRating(review.productId);
    return { success: true };
  }

  // ---- Customer-scoped operations for the mobile app ----

  /** Public storefront list: approved reviews only, newest first. */
  async listApprovedForProduct(productId: string, take: number, skip: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { isActive: true, ratingAvg: true, ratingCount: true },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const where: Prisma.ReviewWhereInput = { productId, isApproved: true };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items: items.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        customerName: r.customer.name,
      })),
      total,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    };
  }

  /** The caller's own review of a product (any approval state), or null. */
  async getMine(customerId: string, productId: string) {
    const review = await this.prisma.review.findUnique({
      where: { productId_customerId: { productId, customerId } },
    });
    if (!review) return null;
    return this.myReview(review);
  }

  /**
   * Create-or-update the caller's review. Gated on a DELIVERED order containing
   * the product. Edits reset isApproved so they re-enter moderation.
   */
  async upsertMine(customerId: string, productId: string, dto: UpsertMyReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { isActive: true },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const delivered = await this.prisma.order.findFirst({
      where: {
        customerId,
        status: OrderStatus.DELIVERED,
        items: { some: { productId } },
      },
      select: { id: true },
    });
    if (!delivered) {
      throw new ForbiddenException(
        'You can only review products from delivered orders',
      );
    }

    const previous = await this.prisma.review.findUnique({
      where: { productId_customerId: { productId, customerId } },
      select: { isApproved: true },
    });

    const review = await this.prisma.review.upsert({
      where: { productId_customerId: { productId, customerId } },
      create: {
        productId,
        customerId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
      // PUT semantics: omitted fields clear. isApproved resets for moderation.
      update: {
        rating: dto.rating,
        title: dto.title ?? null,
        comment: dto.comment ?? null,
        isApproved: false,
      },
    });
    // Un-approving a previously approved review changes the public aggregate.
    if (previous?.isApproved) await this.recomputeProductRating(productId);
    return this.myReview(review);
  }

  /** Delete the caller's own review. */
  async deleteMine(customerId: string, productId: string) {
    const review = await this.prisma.review.findUnique({
      where: { productId_customerId: { productId, customerId } },
    });
    if (!review) throw new NotFoundException('Review not found');
    await this.prisma.review.delete({ where: { id: review.id } });
    if (review.isApproved) await this.recomputeProductRating(productId);
    return { success: true };
  }

  private myReview(r: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isApproved: boolean;
    createdAt: Date;
  }) {
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
    };
  }
}
