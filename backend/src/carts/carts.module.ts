import { Module } from '@nestjs/common';
import { CustomerNotificationsModule } from '../customer-notifications/customer-notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { AppCartController } from './app-cart.controller';
import { AppReorderController } from './app-reorder.controller';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [OrdersModule, CustomerNotificationsModule],
  controllers: [CartsController, AppCartController, AppReorderController],
  providers: [CartsService],
})
export class CartsModule {}
