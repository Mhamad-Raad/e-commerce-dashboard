import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  // Required at sign-up — fed into the AI assistant's consultation context.
  @IsEnum(Gender)
  gender!: Gender;

  // Any Iraqi format; normalized to +9647XXXXXXXXX server-side.
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // Optional — the app is phone-first; email is kept if the user provides one.
  @IsOptional()
  @IsEmail()
  email?: string;
}
