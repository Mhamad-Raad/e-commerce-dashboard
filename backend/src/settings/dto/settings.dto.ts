import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

// "1.2.3" (or empty string to clear the field / turn the gate off).
const VERSION_PATTERN = /^(\d+\.\d+\.\d+)?$/;
// Full link (or empty string to clear the field / hide the channel).
const URL_PATTERN = /^(https?:\/\/\S{1,290})?$/;

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

  @IsOptional()
  @IsString()
  @Matches(URL_PATTERN, { message: 'socialInstagram must be a full https:// link' })
  socialInstagram?: string;

  @IsOptional()
  @IsString()
  @Matches(URL_PATTERN, { message: 'socialFacebook must be a full https:// link' })
  socialFacebook?: string;

  @IsOptional()
  @IsString()
  @Matches(URL_PATTERN, { message: 'socialTiktok must be a full https:// link' })
  socialTiktok?: string;

  @IsOptional()
  @IsString()
  @Matches(URL_PATTERN, { message: 'socialSnapchat must be a full https:// link' })
  socialSnapchat?: string;

  @IsOptional()
  @IsString()
  @Matches(URL_PATTERN, { message: 'socialYoutube must be a full https:// link' })
  socialYoutube?: string;

  @IsOptional()
  @IsString()
  @Matches(URL_PATTERN, { message: 'socialX must be a full https:// link' })
  socialX?: string;

  // Phone number for wa.me, not a URL.
  @IsOptional()
  @IsString()
  @Length(0, 40)
  socialWhatsapp?: string;
}
