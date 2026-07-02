import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateCustomerDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 200)
  name!: string;

  // Required when an admin creates a customer (matches the mobile sign-up rule).
  @IsEnum(Gender)
  gender!: Gender;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  country?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Per-customer AI assistant kill switch (toggled from the customer detail page).
  @IsOptional()
  @IsBoolean()
  assistantEnabled?: boolean;
}
