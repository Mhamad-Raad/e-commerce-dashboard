import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { ASSISTANT_LANGUAGES } from './guest-chat.dto';

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

  // Optional preferred reply language hint.
  @IsOptional()
  @IsIn(ASSISTANT_LANGUAGES)
  language?: string;
}
