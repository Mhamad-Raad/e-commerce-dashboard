import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @Length(4, 10)
  code!: string;
}
