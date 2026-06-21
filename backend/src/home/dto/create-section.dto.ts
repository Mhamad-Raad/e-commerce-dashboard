import { HomeSectionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HomeSectionItemDto } from './section-item.dto';

export class CreateSectionDto {
  @IsEnum(HomeSectionType)
  type!: HomeSectionType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  titleCkb?: string;

  // Free-form per-type display options (e.g. { layout: 'slider' | 'grid' }).
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeSectionItemDto)
  items?: HomeSectionItemDto[];
}
