import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { CartsService } from './carts.service';

// Re-order lives under /app/orders/:id but writes to the cart, so it belongs to
// the carts module (OrdersModule can't depend on CartsModule). Ownership of the
// source order is checked in the service.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/orders')
export class AppReorderController {
  constructor(private carts: CartsService) {}

  @Post(':id/reorder')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  reorder(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
  ) {
    return this.carts.reorderForCustomer(customer.id, id);
  }
}
