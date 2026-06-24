import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { toLang } from '../common/i18n';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { AppCatalogService } from './app-catalog.service';

// Active categories for the mobile app's filter chips.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/categories')
export class AppCategoriesController {
  constructor(private catalog: AppCatalogService) {}

  @Get()
  list(@Query('lang') lang?: string) {
    return this.catalog.listCategories(toLang(lang));
  }
}
