import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { slugify } from '../common/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories.query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  async list(query: ListCategoriesQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.CategoryWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
        ...paginate(page, pageSize),
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: { ...dto, slug: slugify(dto.name) },
      });
    } catch (err) {
      throw this.translateError(err, dto.name);
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.findById(id);
    let updated;
    try {
      updated = await this.prisma.category.update({
        where: { id },
        data: { ...dto, ...(dto.name ? { slug: slugify(dto.name) } : {}) },
      });
    } catch (err) {
      throw this.translateError(err, dto.name);
    }
    // Image changed → clean up the old R2 object (best-effort, non-fatal).
    if (
      dto.imageUrl !== undefined &&
      existing.imageUrl &&
      existing.imageUrl !== updated.imageUrl
    ) {
      await this.uploads.deleteByUrl(existing.imageUrl);
    }
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    await this.prisma.category.delete({ where: { id } });
    await this.uploads.deleteByUrl(existing.imageUrl);
    return { success: true };
  }

  private translateError(err: unknown, name?: string) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return new ConflictException(`Category "${name}" already exists`);
    }
    return err;
  }
}
