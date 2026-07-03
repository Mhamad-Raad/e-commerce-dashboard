import { IsString, Length } from 'class-validator';

export class ResetCustomerPasswordDto {
  // 72 = bcrypt's input limit.
  @IsString()
  @Length(8, 72)
  password!: string;
}
