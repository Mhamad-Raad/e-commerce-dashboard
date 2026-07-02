import { IsIn, IsOptional, IsString, Length } from 'class-validator';

// The only reply languages the apps ever request. Constrained (not free text)
// because this value is interpolated into the SYSTEM prompt — an arbitrary
// string here is a prompt-injection vector, worse on the unauthenticated path.
export const ASSISTANT_LANGUAGES = ['English', 'Arabic', 'Kurdish Sorani'] as const;

// Unauthenticated "guest" chat turn. Like AppChatDto, but the caller is
// identified by an app-generated device id instead of a JWT. The device id is
// NOT trusted on its own (the endpoint is @Public and IP-rate-limited); it only
// scopes the small free-message trial and keeps the thread coherent across turns.
export class GuestChatDto {
  @IsString()
  @Length(8, 64)
  deviceId!: string;

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
