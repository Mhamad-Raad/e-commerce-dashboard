import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
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
    return this.prisma.review.update({
      where: { id },
      data: dto,
      include: reviewInclude,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.review.delete({ where: { id } });
    return { success: true };
  }
}
