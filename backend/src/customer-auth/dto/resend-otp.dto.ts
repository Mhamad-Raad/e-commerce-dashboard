import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class ResendOtpDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;
}
