import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersModule } from '../orders/orders.module';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [InventoryModule, OrdersModule],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
