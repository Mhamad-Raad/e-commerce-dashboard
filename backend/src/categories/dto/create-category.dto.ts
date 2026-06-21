import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttributeDefDto } from './attribute-def.dto';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 60)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  nameAr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  nameCkb?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  descriptionCkb?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Attribute definitions for products in this category (drives the product form).
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDefDto)
  attributeSchema?: AttributeDefDto[];
}
