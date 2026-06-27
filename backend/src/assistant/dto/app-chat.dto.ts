import { IsOptional, IsString, Length } from 'class-validator';

// Customer-app chat turn. Unlike ChatDto, the customer is NEVER supplied by the
// body — it's derived from the customer JWT in the controller.
export class AppChatDto {
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
