import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CartStatus } from '@prisma/client';

export class CreateCartDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;
}
