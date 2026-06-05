import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ListNotificationsQueryDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@Query() query: ListNotificationsQueryDto) {
    return this.notifications.list(query);
  }

  @Get('unread-count')
  unreadCount() {
    return this.notifications.unreadCount();
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead() {
    return this.notifications.markAllRead();
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notifications.markRead(id);
  }
}
