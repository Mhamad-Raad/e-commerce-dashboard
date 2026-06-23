import { Module } from '@nestjs/common';
import { FeeGroupsModule } from '../feegroups/feegroups.module';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppOrdersController } from './app-orders.controller';
import { OrderEventsService } from './order-events.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [InventoryModule, FeeGroupsModule, NotificationsModule],
  controllers: [OrdersController, PaymentsController, AppOrdersController],
  providers: [OrdersService, PaymentsService, OrderEventsService],
  exports: [OrdersService, PaymentsService, OrderEventsService],
})
export class OrdersModule {}
