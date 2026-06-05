import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderEventsService } from './order-events.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [InventoryModule],
  controllers: [OrdersController, PaymentsController],
  providers: [OrdersService, PaymentsService, OrderEventsService],
  exports: [OrdersService, PaymentsService],
})
export class OrdersModule {}
