import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { slugify } from '../common/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { ListStoresQueryDto } from './dto/list-stores.query.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListStoresQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.StoreWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.store.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } },
        ...paginate(page, pageSize),
      }),
      this.prisma.store.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        feeGroup: true,
        _count: { select: { products: true } },
        products: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });
    if (!store) throw new NotFoundException(`Store ${id} not found`);
    return store;
  }

  async create(dto: CreateStoreDto) {
    try {
      return await this.prisma.store.create({
        data: { ...dto, slug: slugify(dto.name) },
      });
    } catch (err) {
      throw this.translateError(err, dto.name);
    }
  }

  async update(id: string, dto: UpdateStoreDto) {
    await this.findById(id);
    try {
      return await this.prisma.store.update({
        where: { id },
        data: { ...dto, ...(dto.name ? { slug: slugify(dto.name) } : {}) },
      });
    } catch (err) {
      throw this.translateError(err, dto.name);
    }
  }

  async remove(id: string) {
    await this.findById(id);
    try {
      await this.prisma.store.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'This store still has products. Reassign or remove them before deleting it.',
        );
      }
      throw err;
    }
  }

  private translateError(err: unknown, name?: string) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return new ConflictException(`Store "${name}" already exists`);
    }
    return err;
  }
}
