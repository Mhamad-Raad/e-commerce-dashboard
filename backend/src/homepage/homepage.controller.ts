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
  Put,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreateBannerDto } from './dto/create-banner.dto';
import { SetFeaturedDto } from './dto/set-featured.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { HomepageService } from './homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(private homepage: HomepageService) {}

  // Public storefront payload (curated banners + featured products/categories/
  // stores) — consumed by the mobile app. Admin mutation routes below stay
  // behind the global JwtAuthGuard.
  @Public()
  @Get()
  get() {
    return this.homepage.getHomepage();
  }

  @Get('banners')
  listBanners() {
    return this.homepage.listBanners();
  }

  @Post('banners')
  createBanner(@Body() dto: CreateBannerDto) {
    return this.homepage.createBanner(dto);
  }

  @Patch('banners/:id')
  updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.homepage.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @HttpCode(HttpStatus.OK)
  removeBanner(@Param('id') id: string) {
    return this.homepage.removeBanner(id);
  }

  @Put('featured/products')
  setFeaturedProducts(@Body() dto: SetFeaturedDto) {
    return this.homepage.setFeaturedProducts(dto.ids);
  }

  @Put('featured/categories')
  setFeaturedCategories(@Body() dto: SetFeaturedDto) {
    return this.homepage.setFeaturedCategories(dto.ids);
  }

  @Put('featured/stores')
  setFeaturedStores(@Body() dto: SetFeaturedDto) {
    return this.homepage.setFeaturedStores(dto.ids);
  }
}
