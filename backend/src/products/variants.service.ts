import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  private async ensureProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
  }

  async list(productId: string) {
    await this.ensureProduct(productId);
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(productId: string, dto: CreateVariantDto) {
    await this.ensureProduct(productId);
    try {
      return await this.prisma.productVariant.create({
        data: { ...dto, productId },
      });
    } catch (err) {
      throw this.translateError(err, dto.sku);
    }
  }

  async update(productId: string, id: string, dto: UpdateVariantDto) {
    const existing = await this.findOwned(productId, id);
    let updated;
    try {
      updated = await this.prisma.productVariant.update({
        where: { id },
        data: dto,
      });
    } catch (err) {
      throw this.translateError(err, dto.sku);
    }
    if (
      dto.imageUrl !== undefined &&
      existing.imageUrl &&
      existing.imageUrl !== updated.imageUrl
    ) {
      await this.uploads.deleteByUrl(existing.imageUrl);
    }
    return updated;
  }

  async remove(productId: string, id: string) {
    const existing = await this.findOwned(productId, id);
    await this.prisma.productVariant.delete({ where: { id } });
    await this.uploads.deleteByUrl(existing.imageUrl);
    return { success: true };
  }

  private async findOwned(productId: string, id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException(
        `Variant ${id} not found on product ${productId}`,
      );
    }
    return variant;
  }

  private translateError(err: unknown, sku?: string) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return new ConflictException(`SKU "${sku}" already exists`);
      }
      if (err.code === 'P2025') {
        return new BadRequestException('Variant not found');
      }
    }
    return err;
  }
}
