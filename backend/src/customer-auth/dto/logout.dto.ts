import { IsOptional, IsString } from 'class-validator';

export class CustomerLogoutDto {
  // When present, only that session's family is revoked (this device). When
  // absent, all of the customer's sessions are revoked (sign out everywhere).
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
