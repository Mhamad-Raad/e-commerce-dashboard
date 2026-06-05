import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

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
}
