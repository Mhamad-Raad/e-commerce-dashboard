import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  customerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  taxCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shippingCents?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  // Optional: snapshot this customer address as the order's shipping address.
  @IsOptional()
  @IsString()
  addressId?: string;

  // Optional: apply a coupon code (validated + redeemed at creation).
  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
