import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { OrdersService } from './orders.service';

// The customer's own orders (mobile app). Scoped to the authenticated customer
// via the customer JWT — a customer can only ever read their own orders.
// @Public() so the global admin guard skips it; CustomerJwtGuard runs instead.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/orders')
export class AppOrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  list(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.orders.listForCustomer(customer.id);
  }

  @Get(':id')
  detail(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
  ) {
    return this.orders.getForCustomer(customer.id, id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
  ) {
    return this.orders.cancelForCustomer(customer.id, id);
  }
}
