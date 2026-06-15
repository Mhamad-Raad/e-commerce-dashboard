import { IsOptional, IsString, Length } from 'class-validator';

export class ChatDto {
  // Until customer auth exists (Stage 5), the caller supplies the customer id.
  @IsString()
  @Length(1, 40)
  customerId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  conversationId?: string;

  @IsString()
  @Length(1, 2000)
  message!: string;

  // Optional preferred reply language hint (e.g. "Kurdish Sorani").
  @IsOptional()
  @IsString()
  @Length(2, 30)
  language?: string;
}
