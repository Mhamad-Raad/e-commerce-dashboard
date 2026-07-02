import { IsString, Length } from 'class-validator';

// Coupon code applied to a cart. A DTO (not an inline body type) so the global
// ValidationPipe rejects a missing/non-string code before it reaches the service.
export class ApplyCouponDto {
  @IsString()
  @Length(1, 64)
  code!: string;
}
