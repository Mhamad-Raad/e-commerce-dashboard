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
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { CheckoutCartDto } from './dto/checkout.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { ListCartsQueryDto } from './dto/list-carts.query.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private carts: CartsService) {}

  @Get()
  list(@Query() query: ListCartsQueryDto) {
    return this.carts.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carts.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCartDto) {
    return this.carts.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.carts.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.carts.remove(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddCartItemDto) {
    return this.carts.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.carts.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.carts.removeItem(id, itemId);
  }

  @Post(':id/checkout')
  checkout(@Param('id') id: string, @Body() dto: CheckoutCartDto) {
    return this.carts.checkout(id, dto);
  }

  @Post(':id/coupon')
  applyCoupon(@Param('id') id: string, @Body() body: { code: string }) {
    return this.carts.applyCoupon(id, body.code);
  }

  @Delete(':id/coupon')
  @HttpCode(HttpStatus.OK)
  removeCoupon(@Param('id') id: string) {
    return this.carts.removeCoupon(id);
  }
}
