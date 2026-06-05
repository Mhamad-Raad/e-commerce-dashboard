import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { slugify } from '../common/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { ListBrandsQueryDto } from './dto/list-brands.query.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListBrandsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.BrandWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
        ...paginate(page, pageSize),
      }),
      this.prisma.brand.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { feeGroup: true, _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    return brand;
  }

  async create(dto: CreateBrandDto) {
    try {
      return await this.prisma.brand.create({
        data: { ...dto, slug: slugify(dto.name) },
      });
    } catch (err) {
      throw this.translateError(err, dto.name);
    }
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findById(id);
    try {
      return await this.prisma.brand.update({
        where: { id },
        data: { ...dto, ...(dto.name ? { slug: slugify(dto.name) } : {}) },
      });
    } catch (err) {
      throw this.translateError(err, dto.name);
    }
  }

  async remove(id: string) {
    await this.findById(id);
    // Products keep existing; their brandId is cleared by the FK SetNull.
    await this.prisma.brand.delete({ where: { id } });
    return { success: true };
  }

  private translateError(err: unknown, name?: string) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return new ConflictException(`Brand "${name}" already exists`);
      }
      if (err.code === 'P2003') {
        return new BadRequestException('The selected fee group does not exist');
      }
    }
    return err;
  }
}
