import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { couponApplicabilityError, couponDiscountCents } from '../common/coupon';
import { buildPaginated, paginate } from '../common/pagination';
import { effectivePriceCents } from '../common/pricing';
import { CustomerNotificationsService } from '../customer-notifications/customer-notifications.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../orders/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppCheckoutDto } from './dto/app-checkout.dto';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { CheckoutCartDto } from './dto/checkout.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { ListCartsQueryDto } from './dto/list-carts.query.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

const cartInclude = {
  customer: { select: { id: true, name: true, email: true } },
  coupon: true,
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          imageUrl: true,
          currency: true,
          // Store + lead-days so the app can group cart items per store and show
          // an estimated-arrival window (product override, else store default).
          minLeadDays: true,
          maxLeadDays: true,
          store: { select: { id: true, name: true, minLeadDays: true, maxLeadDays: true } },
        },
      },
    },
    orderBy: { id: 'asc' as const },
  },
};

@Injectable()
export class CartsService {
  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
    private payments: PaymentsService,
    private customerNotifications: CustomerNotificationsService,
  ) {}

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
    if (!product.isActive) {
      throw new BadRequestException('This product is no longer available');
    }

    // Resolve an optional variant: snapshot its name + price, otherwise fall
    // back to the product's own price (a "simple" product with no variants).
    let variantId: string | null = null;
    let variantName: string | null = null;
    let priceCents = effectivePriceCents(product.priceCents, product.salePriceCents);
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant || variant.productId !== dto.productId) {
        throw new BadRequestException(
          'Selected variant does not belong to this product',
        );
      }
      if (!variant.isActive) {
        throw new BadRequestException('This variant is no longer available');
      }
      variantId = variant.id;
      variantName = variant.name;
      priceCents = effectivePriceCents(variant.priceCents, variant.salePriceCents);
    }

    // Dedupe explicitly: the (cartId, productId, variantId) unique index does NOT
    // catch duplicates when variantId is NULL (Postgres treats NULLs as distinct),
    // so a simple product could otherwise be added as multiple lines.
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId, productId: dto.productId, variantId },
    });
    if (existing) {
      throw new ConflictException(
        'This product/variant is already in the cart — update its quantity instead',
      );
    }

    await this.prisma.cartItem.create({
      data: {
        cartId,
        productId: dto.productId,
        variantId,
        variantName,
        quantity: dto.quantity,
        priceCents,
      },
    });
    await this.recomputeCoupon(cartId);
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
    await this.recomputeCoupon(cartId);
    return this.findById(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException(`Item ${itemId} not found in cart ${cartId}`);
    }
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    await this.recomputeCoupon(cartId);
    return this.findById(cartId);
  }

  private cartSubtotal(items: { priceCents: number; quantity: number }[]) {
    return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  }

  async applyCoupon(cartId: string, code: string) {
    const cart = await this.findById(cartId);
    const subtotal = this.cartSubtotal(cart.items);
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    const error = couponApplicabilityError(coupon, subtotal, new Date());
    if (error || !coupon) throw new BadRequestException(error ?? 'Invalid coupon');

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { couponId: coupon.id, discountCents: couponDiscountCents(coupon, subtotal) },
    });
    return this.findById(cartId);
  }

  async removeCoupon(cartId: string) {
    await this.findById(cartId);
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { couponId: null, discountCents: 0 },
    });
    return this.findById(cartId);
  }

  /**
   * Turn a cart into an order: carries items + coupon over (re-resolved at current
   * prices via OrdersService.create), snapshots the chosen address, records a
   * payment, and marks the cart CHECKED_OUT. Used for staff-assisted checkout.
   */
  async checkout(
    cartId: string,
    dto: CheckoutCartDto,
    actorId?: string,
    itemIds?: string[],
  ) {
    const cart = await this.findById(cartId);
    if (cart.status === 'CHECKED_OUT') {
      throw new BadRequestException('This cart has already been checked out');
    }
    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot check out an empty cart');
    }

    // Partial checkout (app selection): order only the given items. Validate
    // before claiming the cart so a stale id doesn't bounce the cart status.
    let itemsToOrder = cart.items;
    if (itemIds && itemIds.length > 0) {
      const byId = new Map(cart.items.map((i) => [i.id, i]));
      if (itemIds.some((id) => !byId.has(id))) {
        throw new BadRequestException(
          'Some selected items are no longer in the cart',
        );
      }
      itemsToOrder = itemIds.map((id) => byId.get(id)!);
    }

    // Atomically claim the cart BEFORE creating the order so a double-tap /
    // retried request can't produce two orders (with double stock decrement).
    // Only one caller wins the OPEN→CHECKED_OUT transition; the rest get 0 rows.
    const claim = await this.prisma.cart.updateMany({
      where: { id: cartId, status: 'OPEN' },
      data: { status: 'CHECKED_OUT' },
    });
    if (claim.count === 0) {
      throw new BadRequestException('This cart has already been checked out');
    }

    try {
      const order = await this.orders.create(
        {
          customerId: cart.customerId,
          items: itemsToOrder.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? undefined,
            quantity: i.quantity,
          })),
          couponCode: cart.coupon?.code,
          addressId: dto.addressId,
          notes: dto.notes,
          taxCents: dto.taxCents,
          shippingCents: dto.shippingCents,
        },
        actorId,
      );

      await this.payments.create(order.id, {
        method: dto.paymentMethod,
        amountCents: order.totalCents,
        status: dto.markPaid ? 'PAID' : 'PENDING',
      });

      // Partial checkout: unselected items move to a fresh OPEN cart so the
      // customer keeps them. The coupon was consumed by this order, so the new
      // cart starts without one.
      const orderedIds = new Set(itemsToOrder.map((i) => i.id));
      const leftover = cart.items.filter((i) => !orderedIds.has(i.id));
      if (leftover.length > 0) {
        await this.prisma.$transaction(async (tx) => {
          const newCart = await tx.cart.create({
            data: { customerId: cart.customerId, status: 'OPEN' },
          });
          await tx.cartItem.updateMany({
            where: { id: { in: leftover.map((i) => i.id) } },
            data: { cartId: newCart.id },
          });
        });
      }

      // Re-fetch so the returned order includes the payment just recorded.
      return this.orders.findById(order.id);
    } catch (err) {
      // Order/payment creation failed (stock, coupon, etc. — its own tx rolled
      // back). Release the claim so the customer can fix the issue and retry.
      await this.prisma.cart.updateMany({
        where: { id: cartId, status: 'CHECKED_OUT' },
        data: { status: 'OPEN' },
      });
      throw err;
    }
  }

  // ---- Customer-scoped ("my cart") operations for the mobile app ----
  // The cart id is always derived from the authenticated customer, never taken
  // from the client, so a customer can only ever touch their own cart.

  /** The customer's current OPEN cart, created on first access. */
  async getOrCreateOpenCart(customerId: string) {
    const existing = await this.prisma.cart.findFirst({
      where: { customerId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return this.findById(existing.id);
    const created = await this.prisma.cart.create({
      data: { customerId, status: 'OPEN' },
    });
    return this.findById(created.id);
  }

  private async openCartId(customerId: string) {
    return (await this.getOrCreateOpenCart(customerId)).id;
  }

  async addItemForCustomer(customerId: string, dto: AddCartItemDto) {
    return this.addItem(await this.openCartId(customerId), dto);
  }

  async updateItemForCustomer(customerId: string, itemId: string, dto: UpdateCartItemDto) {
    return this.updateItem(await this.openCartId(customerId), itemId, dto);
  }

  async removeItemForCustomer(customerId: string, itemId: string) {
    return this.removeItem(await this.openCartId(customerId), itemId);
  }

  async applyCouponForCustomer(customerId: string, code: string) {
    return this.applyCoupon(await this.openCartId(customerId), code);
  }

  async removeCouponForCustomer(customerId: string) {
    return this.removeCoupon(await this.openCartId(customerId));
  }

  /**
   * Dry-run the money breakdown (subtotal/discount/tax/fees/total) for the cart.
   * `itemIds` limits the quote to the app's locally-selected items; unknown ids
   * are ignored (it's a dry run).
   */
  async previewForCustomer(customerId: string, itemIds?: string[]) {
    const cart = await this.getOrCreateOpenCart(customerId);
    const items =
      itemIds && itemIds.length > 0
        ? cart.items.filter((i) => itemIds.includes(i.id))
        : cart.items;
    if (items.length === 0) {
      return {
        subtotalCents: 0,
        discountCents: 0,
        couponCode: cart.coupon?.code ?? null,
        taxCents: 0,
        shippingCents: 0,
        feesCents: 0,
        feesLabel: null,
        totalCents: 0,
        currency: 'IQD',
      };
    }
    return this.orders.preview({
      customerId,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? undefined,
        quantity: i.quantity,
      })),
      couponCode: cart.coupon?.code,
    });
  }

  /**
   * Merge a past order's items back into the customer's open cart. Unavailable
   * products/variants are skipped; quantities are clamped to the stock still
   * free on top of what the cart already holds.
   */
  async reorderForCustomer(customerId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { orderBy: { id: 'asc' } } },
    });
    if (!order || order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    const cart = await this.getOrCreateOpenCart(customerId);
    const skipped: { name: string; reason: 'unavailable' | 'out_of_stock' }[] = [];
    let added = 0;

    for (const item of order.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.isActive) {
        skipped.push({ name: item.name, reason: 'unavailable' });
        continue;
      }

      let variant: { id: string; name: string; stock: number; priceCents: number; salePriceCents: number | null } | null = null;
      if (item.variantId) {
        const v = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!v || v.productId !== product.id || !v.isActive) {
          skipped.push({ name: item.name, reason: 'unavailable' });
          continue;
        }
        variant = v;
      } else if (item.variantName) {
        // The variant row was deleted (FK SetNull) — that option is gone.
        skipped.push({ name: item.name, reason: 'unavailable' });
        continue;
      }

      const existing = await this.prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: product.id, variantId: variant?.id ?? null },
      });
      // Clamp to stock minus what the cart already claims for this line.
      const stock = variant ? variant.stock : product.stock;
      const quantity = Math.min(item.quantity, stock - (existing?.quantity ?? 0));
      if (quantity <= 0) {
        skipped.push({ name: item.name, reason: 'out_of_stock' });
        continue;
      }

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        // Snapshot the CURRENT effective price, not the old order's.
        const priceCents = variant
          ? effectivePriceCents(variant.priceCents, variant.salePriceCents)
          : effectivePriceCents(product.priceCents, product.salePriceCents);
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            variantId: variant?.id ?? null,
            variantName: variant?.name ?? null,
            quantity,
            priceCents,
          },
        });
      }
      added += 1;
    }

    if (added > 0) await this.recomputeCoupon(cart.id);
    return { cartId: cart.id, added, skipped };
  }

  /**
   * Place the customer's order from their open cart. Tax + fees are resolved
   * server-side; the payment is recorded PENDING (settled manually in v1). No
   * staff actor — the customer initiated it.
   */
  async checkoutForCustomer(customerId: string, dto: AppCheckoutDto) {
    const cart = await this.getOrCreateOpenCart(customerId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }
    const order = await this.checkout(
      cart.id,
      {
        addressId: dto.addressId,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
        markPaid: false,
      },
      undefined,
      dto.itemIds,
    );

    // Best-effort order-confirmation push (never throws / never blocks checkout).
    void this.customerNotifications.notify(customerId, 'ORDER_PLACED', {
      orderId: order.id,
      number: order.number,
    });

    return order;
  }

  // Keep the cart's stored discount in sync after items change; drop the coupon
  // if it no longer applies (e.g. subtotal fell below its minimum).
  private async recomputeCoupon(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true, coupon: true },
    });
    if (!cart || !cart.coupon) return;

    const subtotal = this.cartSubtotal(cart.items);
    const error = couponApplicabilityError(cart.coupon, subtotal, new Date());
    await this.prisma.cart.update({
      where: { id: cartId },
      data: error
        ? { couponId: null, discountCents: 0 }
        : { discountCents: couponDiscountCents(cart.coupon, subtotal) },
    });
  }
}
