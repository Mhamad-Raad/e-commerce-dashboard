import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

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

  async create(dto: CreateProductDto) {
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
    await this.findById(id);
    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
        include: { store: true, category: true },
      });
    } catch (err) {
      throw this.translateError(err, dto.sku);
    }
  }

  async remove(id: string) {
    await this.findById(id);
    try {
      await this.prisma.product.delete({ where: { id } });
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

