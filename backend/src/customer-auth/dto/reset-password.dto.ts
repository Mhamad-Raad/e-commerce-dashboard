import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @Length(4, 10)
  code!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
