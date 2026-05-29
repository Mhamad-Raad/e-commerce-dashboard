import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildPaginated, paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { ListCartsQueryDto } from './dto/list-carts.query.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

const cartInclude = {
  customer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true, imageUrl: true } },
    },
    orderBy: { id: 'asc' as const },
  },
};

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async list(query: ListCartsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.CartWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.search) {
      where.customer = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.cart.findMany({
        where,
        include: cartInclude,
        orderBy: { createdAt: 'desc' },
        ...paginate(page, pageSize),
      }),
      this.prisma.cart.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async findById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: cartInclude,
    });
    if (!cart) throw new NotFoundException(`Cart ${id} not found`);
    return cart;
  }

  async create(dto: CreateCartDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException(`Customer ${dto.customerId} not found`);

    const cart = await this.prisma.cart.create({
      data: { customerId: dto.customerId, status: dto.status ?? 'OPEN' },
    });
    return this.findById(cart.id);
  }

  async update(id: string, dto: UpdateCartDto) {
    await this.findById(id);
    await this.prisma.cart.update({ where: { id }, data: dto });
    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.cart.delete({ where: { id } });
    return { success: true };
  }

  async addItem(cartId: string, dto: AddCartItemDto) {
    await this.findById(cartId);
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    try {
      await this.prisma.cartItem.create({
        data: {
          cartId,
          productId: dto.productId,
          quantity: dto.quantity,
          priceCents: product.priceCents,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Product already in this cart — update its quantity instead');
      }
      throw err;
    }
    return this.findById(cartId);
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException(`Item ${itemId} not found in cart ${cartId}`);
    }
    if (dto.quantity === undefined) {
      throw new BadRequestException('quantity is required');
    }
    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity } });
    return this.findById(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException(`Item ${itemId} not found in cart ${cartId}`);
    }
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.findById(cartId);
  }
}
