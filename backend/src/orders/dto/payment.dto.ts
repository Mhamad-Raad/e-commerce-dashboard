import { PaymentMethod, PaymentStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsInt()
  @Min(0)
  amountCents!: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  reference?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;

  @IsOptional()
  @IsISO8601()
  paidAt?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountCents?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  reference?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;

  @IsOptional()
  @IsISO8601()
  paidAt?: string;
}
