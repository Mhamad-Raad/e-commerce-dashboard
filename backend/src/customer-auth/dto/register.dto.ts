import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(1, 200)
  name!: string;

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
