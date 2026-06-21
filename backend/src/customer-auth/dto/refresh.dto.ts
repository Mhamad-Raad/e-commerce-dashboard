import { IsNotEmpty, IsString } from 'class-validator';

// Mobile holds the refresh token itself (no cookie) and sends it in the body.
export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
