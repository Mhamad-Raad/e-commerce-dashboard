import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { toLang } from '../common/i18n';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { CustomerNotificationsService } from './customer-notifications.service';
import {
  ListCustomerNotificationsQueryDto,
  RegisterDeviceDto,
  UnregisterDeviceDto,
} from './dto/customer-notification.dto';

// Mobile customer notification centre + push-device registration. Same scoping
// pattern as AppAddressesController: @Public() bypasses the global admin guard,
// CustomerJwtGuard runs instead, and every action is bound to the JWT's customer
// id — a customer can only ever touch their own notifications/devices.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/notifications')
export class AppNotificationsController {
  constructor(private notifications: CustomerNotificationsService) {}

  @Get()
  list(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Query() query: ListCustomerNotificationsQueryDto,
    @Query('lang') lang?: string,
  ) {
    return this.notifications.list(customer.id, query, toLang(lang));
  }

  @Get('unread-count')
  unreadCount(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.notifications.unreadCount(customer.id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  markAllRead(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.notifications.markAllRead(customer.id);
  }

  @Patch(':id/read')
  markRead(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(customer.id, id);
  }

  // ---- Push device registration (FCM token lifecycle) ----

  @Post('devices')
  @HttpCode(HttpStatus.OK)
  registerDevice(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.notifications.registerDevice(customer.id, dto);
  }

  @Delete('devices')
  @HttpCode(HttpStatus.OK)
  unregisterDevice(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: UnregisterDeviceDto,
  ) {
    return this.notifications.unregisterDevice(customer.id, dto.token);
  }
}
