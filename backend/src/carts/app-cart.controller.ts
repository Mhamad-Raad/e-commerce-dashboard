import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { CartsService } from './carts.service';
import { AppCheckoutDto } from './dto/app-checkout.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';

// The customer's own cart (mobile app). Scoped to the authenticated customer via
// the customer JWT — the cart is resolved server-side from the token, never by a
// client-supplied id (unlike the admin CartsController). @Public() so the global
// admin guard skips it; CustomerJwtGuard runs instead.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/cart')
export class AppCartController {
  constructor(private carts: CartsService) {}

  @Get()
  myCart(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.carts.getOrCreateOpenCart(customer.id);
  }

  @Get('preview')
  preview(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.carts.previewForCustomer(customer.id);
  }

  @Post('items')
  addItem(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: AddCartItemDto,
  ) {
    return this.carts.addItemForCustomer(customer.id, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.carts.updateItemForCustomer(customer.id, itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  removeItem(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('itemId') itemId: string,
  ) {
    return this.carts.removeItemForCustomer(customer.id, itemId);
  }

  @Post('coupon')
  applyCoupon(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() body: ApplyCouponDto,
  ) {
    return this.carts.applyCouponForCustomer(customer.id, body.code);
  }

  @Delete('coupon')
  @HttpCode(HttpStatus.OK)
  removeCoupon(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.carts.removeCouponForCustomer(customer.id);
  }

  @Post('checkout')
  checkout(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: AppCheckoutDto,
  ) {
    return this.carts.checkoutForCustomer(customer.id, dto);
  }
}
