import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CSV_MAX_ROWS, toCsv } from '../common/csv';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersQueryDto } from './dto/list-customers.query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private uploads: UploadsService,
  ) {}

  private listWhere(query: ListCustomersQueryDto): Prisma.CustomerWhereInput {
    const where: Prisma.CustomerWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
    return where;
  }

  async list(query: ListCustomersQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.listWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.customer.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async exportCsv(query: ListCustomersQueryDto) {
    const where = this.listWhere(query);

    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: CSV_MAX_ROWS,
    });

    return toCsv(customers, [
      { header: 'Name', value: (c) => c.name },
      { header: 'Email', value: (c) => c.email },
      { header: 'Phone', value: (c) => c.phone ?? '' },
      { header: 'City', value: (c) => c.city ?? '' },
      { header: 'Country', value: (c) => c.country ?? '' },
      { header: 'Active', value: (c) => (c.isActive ? 'yes' : 'no') },
      { header: 'Joined', value: (c) => c.createdAt.toISOString() },
    ]);
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] },
        // Active cart(s) with line items, for the customer detail page.
        carts: {
          where: { status: 'OPEN' },
          orderBy: { updatedAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, imageUrl: true, currency: true },
                },
              },
            },
          },
        },
        // Wishlisted products (populated by the app once it ships favoriting).
        // Bounded: show the most recent — a customer could favorite many items.
        favorites: {
          orderBy: { createdAt: 'desc' },
          take: 60,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                priceCents: true,
                currency: true,
              },
            },
          },
        },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({ data: dto });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Email "${dto.email}" already exists`);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const existing = await this.findById(id);
    let updated;
    try {
      updated = await this.prisma.customer.update({ where: { id }, data: dto });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Email "${dto.email}" already exists`);
      }
      throw err;
    }
    if (
      dto.avatarUrl !== undefined &&
      existing.avatarUrl &&
      existing.avatarUrl !== updated.avatarUrl
    ) {
      await this.uploads.deleteByUrl(existing.avatarUrl);
    }
    return updated;
  }

  async remove(id: string) {
    const existing = await this.findById(id);
    try {
      await this.prisma.customer.delete({ where: { id } });
      await this.uploads.deleteByUrl(existing.avatarUrl);
      return { success: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'This customer has existing orders and cannot be deleted. Deactivate them instead.',
        );
      }
      throw err;
    }
  }
}
