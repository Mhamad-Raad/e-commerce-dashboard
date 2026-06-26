import { Module } from '@nestjs/common';
import { FcmModule } from '../fcm/fcm.module';
import { AppNotificationsController } from './app-notifications.controller';
import { CustomerNotificationsService } from './customer-notifications.service';

@Module({
  imports: [FcmModule],
  controllers: [AppNotificationsController],
  providers: [CustomerNotificationsService],
  // Exported so OrdersModule / CartsModule can fire notifications on order events.
  exports: [CustomerNotificationsService],
})
export class CustomerNotificationsModule {}
