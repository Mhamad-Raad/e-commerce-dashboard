import { Module } from '@nestjs/common';
import { AppCategoriesController } from './app-categories.controller';
import { AppCatalogService } from './app-catalog.service';
import { AppFavoritesController } from './app-favorites.controller';
import { AppProductsController } from './app-products.controller';
import { AppStoresController } from './app-stores.controller';

// Mobile-app storefront reads: product browse/search/detail, stores, categories,
// and favorites. Reuses the global PrismaService; the customer JWT strategy is
// provided by CustomerAuthModule.
@Module({
  controllers: [
    AppProductsController,
    AppStoresController,
    AppCategoriesController,
    AppFavoritesController,
  ],
  providers: [AppCatalogService],
})
export class AppCatalogModule {}
