import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
import { couponApplicabilityError, couponDiscountCents } from '../common/coupon';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from './dto/coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  private assertValueForType(type: DiscountType, value: number) {
    if (type === 'PERCENT' && (value < 1 || value > 100)) {
      throw new BadRequestException('Percent value must be between 1 and 100');
    }
  }

  async list(query: { search?: string; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.CouponWhereInput = query.search
      ? { code: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.coupon.count({ where }),
    ]);
    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon ${id} not found`);
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    this.assertValueForType(dto.type, dto.value);
    try {
      return await this.prisma.coupon.create({
        data: {
          ...dto,
          code: dto.code.toUpperCase(),
          startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        },
      });
    } catch (err) {
      throw this.translateError(err, dto.code);
    }
  }

  async update(id: string, dto: UpdateCouponDto) {
    const existing = await this.findById(id);
    this.assertValueForType(dto.type ?? existing.type, dto.value ?? existing.value);
    const data: Prisma.CouponUpdateInput = { ...dto };
    if (dto.code) data.code = dto.code.toUpperCase();
    if (dto.startsAt !== undefined) data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    try {
      return await this.prisma.coupon.update({ where: { id }, data });
    } catch (err) {
      throw this.translateError(err, dto.code);
    }
  }

  async remove(id: string) {
    await this.findById(id);
    // Clear the cached discount on carts using this coupon; the FK SetNull only
    // clears couponId, which would otherwise leave a stale discountCents behind.
    await this.prisma.$transaction([
      this.prisma.cart.updateMany({
        where: { couponId: id },
        data: { discountCents: 0 },
      }),
      this.prisma.coupon.delete({ where: { id } }),
    ]);
    return { success: true };
  }

  /** Validate a code against a subtotal; throws if not applicable. */
  async validate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    const error = couponApplicabilityError(coupon, dto.subtotalCents, new Date());
    if (error || !coupon) throw new BadRequestException(error ?? 'Invalid coupon');
    return { coupon, discountCents: couponDiscountCents(coupon, dto.subtotalCents) };
  }

  private translateError(err: unknown, code?: string) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return new ConflictException(`Coupon code "${code}" already exists`);
    }
    return err;
  }
}
