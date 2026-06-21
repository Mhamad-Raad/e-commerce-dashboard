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
  labelAr?: string;

  @IsOptional()
  @IsString()
  labelCkb?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  subtitleAr?: string;

  @IsOptional()
  @IsString()
  subtitleCkb?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  badgeAr?: string;

  @IsOptional()
  @IsString()
  badgeCkb?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaLabelAr?: string;

  @IsOptional()
  @IsString()
  ctaLabelCkb?: string;

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
