import { HomeTargetType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

/// One item inside a home section (a banner slide, brand logo, category, product,
/// or blog card). `targetType` decides which reference id below is meaningful.
export class HomeSectionItemDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsEnum(HomeTargetType)
  targetType!: HomeTargetType;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsString()
  blogPostId?: string;

  @IsOptional()
  @IsString()
  url?: string;
}
