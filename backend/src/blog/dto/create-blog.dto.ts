import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @Length(1, 200)
  titleEn!: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  titleAr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  excerptEn?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  excerptAr?: string;

  @IsOptional()
  @IsString()
  bodyEn?: string;

  @IsOptional()
  @IsString()
  bodyAr?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
