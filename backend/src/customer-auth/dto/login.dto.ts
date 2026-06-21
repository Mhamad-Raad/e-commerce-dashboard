import { IsNotEmpty, IsString } from 'class-validator';

export class CustomerLoginDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
