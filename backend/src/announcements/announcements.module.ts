import { Module } from '@nestjs/common';
import { CustomerNotificationsModule } from '../customer-notifications/customer-notifications.module';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

@Module({
  imports: [CustomerNotificationsModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
