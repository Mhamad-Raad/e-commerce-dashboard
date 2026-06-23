import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

/**
 * Customer self-checkout payload (mobile app). Unlike the staff [CheckoutCartDto],
 * the customer cannot set tax/shipping/markPaid — the server resolves tax + fees
 * from fee groups and records the payment as PENDING (no gateway in v1; COD and
 * transfers are settled manually).
 */
export class AppCheckoutDto {
  @IsString()
  addressId!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
