import { IsBooleanString, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DevicePlatform } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListCustomerNotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;
}

export class RegisterDeviceDto {
  @IsString()
  @MaxLength(4096) // FCM tokens are long but bounded; reject anything absurd.
  token!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;

  // Device's app language, used to render the push tray text. Defaults to en.
  @IsOptional()
  @IsIn(['en', 'ar', 'ckb'])
  locale?: string;
}

export class UnregisterDeviceDto {
  @IsString()
  @MaxLength(4096)
  token!: string;
}
