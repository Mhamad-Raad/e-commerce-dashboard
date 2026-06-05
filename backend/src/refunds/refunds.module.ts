import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [InventoryModule, OrdersModule, NotificationsModule],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
