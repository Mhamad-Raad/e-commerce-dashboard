import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @IsString()
  @Matches(/^[A-Z0-9_-]{2,40}$/i, {
    message: 'sku must be 2-40 chars, letters/digits/_/- only',
  })
  sku!: string;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  salePriceCents?: number | null;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  // Product rating shown to shoppers — sourced from the mobile app, manually
  // overridable here. Decoupled from the dashboard's review moderation list.
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  ratingAvg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ratingCount?: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsString()
  @Length(1, 40)
  storeId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
