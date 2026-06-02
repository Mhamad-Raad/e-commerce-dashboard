import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @Length(1, 160)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  subtitle?: string;

  @IsUrl({ require_tld: false })
  imageUrl!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  linkUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
