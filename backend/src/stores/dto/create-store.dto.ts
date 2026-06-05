import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  bannerUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  feeGroupId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
