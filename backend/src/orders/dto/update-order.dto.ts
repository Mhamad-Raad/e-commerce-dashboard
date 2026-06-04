import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, ValidateIf } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Length(0, 80)
  trackingNumber?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
