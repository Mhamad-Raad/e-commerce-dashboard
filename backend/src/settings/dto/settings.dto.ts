import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

// "1.2.3" (or empty string to clear the field / turn the gate off).
const VERSION_PATTERN = /^(\d+\.\d+\.\d+)?$/;

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @Length(0, 120)
  businessName?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  businessPhone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  businessAddress?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  defaultCurrency?: string;

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN, {
    message: 'minAppVersion must look like 1.2.3',
  })
  minAppVersion?: string;

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN, {
    message: 'latestAppVersion must look like 1.2.3',
  })
  latestAppVersion?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  appStoreUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  playStoreUrl?: string;
}
