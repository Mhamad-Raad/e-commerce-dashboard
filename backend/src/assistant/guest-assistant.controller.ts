import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { AssistantChatService } from './assistant-chat.service';
import { GuestChatDto } from './dto/guest-chat.dto';

// Unauthenticated "try before you sign up" assistant. A logged-OUT visitor gets
// a few free turns (see GUEST_MESSAGE_LIMIT) keyed by an app-generated device id,
// then the app shows a login wall. @Public() skips the admin guard and there is
// NO customer guard — anyone can call it, which is why it's both IP-rate-limited
// here AND capped per device server-side. Stays dormant (503) until the assistant
// is configured, exactly like the customer/admin paths.
@Public()
@Controller('app/assistant/guest')
export class GuestAssistantController {
  constructor(private chat: AssistantChatService) {}

  // Anonymous + paid, so throttle harder than the global limit. Combined with the
  // per-device lifetime cap, this bounds how much a single IP can burn even by
  // rotating device ids.
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('chat')
  send(@Body() dto: GuestChatDto) {
    const { deviceId, ...turn } = dto;
    return this.chat.chatForGuest(deviceId, turn);
  }
}
