import { Module } from '@nestjs/common';
import { AppCatalogService } from './app-catalog.service';
import { AppFavoritesController } from './app-favorites.controller';
import { AppProductsController } from './app-products.controller';

// Mobile-app storefront reads: product detail + favorites. Reuses the global
// PrismaService; the customer JWT strategy is provided by CustomerAuthModule.
@Module({
  controllers: [AppProductsController, AppFavoritesController],
  providers: [AppCatalogService],
})
export class AppCatalogModule {}
