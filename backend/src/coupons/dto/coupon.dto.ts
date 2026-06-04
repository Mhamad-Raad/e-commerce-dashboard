import { DiscountType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,40}$/i, {
    message: 'code must be 2-40 chars, letters/digits/_/- only',
  })
  code!: string;

  @IsEnum(DiscountType)
  type!: DiscountType;

  @IsInt()
  @Min(1)
  value!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSubtotalCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,40}$/i, {
    message: 'code must be 2-40 chars, letters/digits/_/- only',
  })
  code?: string;

  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @IsOptional()
  @IsInt()
  @Min(1)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSubtotalCents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number | null;

  @IsOptional()
  @IsISO8601()
  startsAt?: string | null;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @IsString()
  code!: string;

  @IsInt()
  @Min(0)
  subtotalCents!: number;
}
