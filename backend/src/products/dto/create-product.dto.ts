import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
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
  @Length(0, 200)
  nameAr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  nameCkb?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  descriptionCkb?: string;

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
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  // Optional override of the store's estimated-delivery window, in days.
  // Send null to clear an override and fall back to the store default.
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  @Max(365)
  minLeadDays?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  @Max(365)
  maxLeadDays?: number | null;

  // Cover image — required. (UpdateProductDto makes it optional via PartialType,
  // but the dashboard form always sends it.)
  @IsUrl({ require_tld: false })
  imageUrl!: string;

  // Optional gallery (additional images beyond the cover), ordered.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ require_tld: false }, { each: true })
  images?: string[];

  // Values for the category's attribute schema, keyed by attribute key. Shape is
  // validated by the dashboard form against the category; stored as JSON here.
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

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
