import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @Length(1, 120)
  name!: string;

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

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,40}$/i, {
    message: 'sku must be 2-40 chars, letters/digits/_/- only',
  })
  sku?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  salePriceCents?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
