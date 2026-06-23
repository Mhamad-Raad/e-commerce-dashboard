import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { toLang } from '../common/i18n';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { AppCatalogService } from './app-catalog.service';

// Storefront product detail for the mobile app. Customer-scoped so the response
// can include the customer's favorite state. @Public() so the global admin guard
// skips it; CustomerJwtGuard runs instead.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/products')
export class AppProductsController {
  constructor(private catalog: AppCatalogService) {}

  @Get(':id')
  detail(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.catalog.productDetail(customer.id, id, toLang(lang));
  }
}
