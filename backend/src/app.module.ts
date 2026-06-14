import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { FeeGroupsModule } from './feegroups/feegroups.module';
import { HealthController } from './health/health.controller';
import { HomepageModule } from './homepage/homepage.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { RefundsModule } from './refunds/refunds.module';
import { ReportsModule } from './reports/reports.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { StoresModule } from './stores/stores.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limit: 200 requests / minute / IP — generous for a polling
    // admin dashboard, but caps scraping/abuse. Auth routes are far stricter
    // (see @Throttle on AuthController).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 200 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    StoresModule,
    CustomersModule,
    CartsModule,
    OrdersModule,
    CouponsModule,
    FeeGroupsModule,
    HomepageModule,
    InventoryModule,
    NotificationsModule,
    RefundsModule,
    ReportsModule,
    ReviewsModule,
    SettingsModule,
    UploadsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Rate limiting runs before auth so it also protects unauthenticated routes
    // (login/refresh).
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
