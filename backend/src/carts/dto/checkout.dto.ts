import { PaymentMethod } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CheckoutCartDto {
  @IsString()
  addressId!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  // Whether the payment is collected now (PAID) or still due (PENDING, e.g. COD).
  @IsOptional()
  @IsBoolean()
  markPaid?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  taxCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shippingCents?: number;
}
