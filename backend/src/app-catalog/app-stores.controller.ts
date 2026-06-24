import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { toLang } from '../common/i18n';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { AppCatalogService } from './app-catalog.service';

// Storefront stores/brands for the mobile app.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/stores')
export class AppStoresController {
  constructor(private catalog: AppCatalogService) {}

  @Get()
  list(@Query('lang') lang?: string) {
    return this.catalog.listStores(toLang(lang));
  }

  @Get(':id')
  detail(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.catalog.storeDetail(id, toLang(lang));
  }
}
