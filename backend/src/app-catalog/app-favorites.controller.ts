import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { toLang } from '../common/i18n';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { AppCatalogService } from './app-catalog.service';

// The customer's favorites (mobile app). Scoped to the authenticated customer.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/favorites')
export class AppFavoritesController {
  constructor(private catalog: AppCatalogService) {}

  @Get()
  list(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Query('lang') lang?: string,
  ) {
    return this.catalog.listFavorites(customer.id, toLang(lang));
  }

  @Post(':productId')
  add(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('productId') productId: string,
  ) {
    return this.catalog.addFavorite(customer.id, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('productId') productId: string,
  ) {
    return this.catalog.removeFavorite(customer.id, productId);
  }
}
