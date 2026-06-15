import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AssistantService } from './assistant.service';
import { AssistantChatService } from './assistant-chat.service';
import { UpdateAssistantConfigDto } from './dto/update-assistant-config.dto';
import { ChatDto } from './dto/chat.dto';

@Controller('assistant')
export class AssistantController {
  constructor(
    private assistant: AssistantService,
    private chat: AssistantChatService,
  ) {}

  @Get('config')
  getConfig() {
    return this.assistant.getConfig();
  }

  @Patch('config')
  updateConfig(@Body() dto: UpdateAssistantConfigDto) {
    return this.assistant.updateConfig(dto);
  }

  // Chat turn. Auth is the admin JWT for now; when customer auth ships (Stage 5)
  // the app will derive customerId from the customer token instead of the body.
  // CPU-heavy + paid, so throttle harder than the global limit.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('chat')
  sendMessage(@Body() dto: ChatDto) {
    return this.chat.chat(dto);
  }

  // Admin viewing of a customer's chat history (customer detail page).
  @Get('customers/:customerId/conversations')
  listConversations(@Param('customerId') customerId: string) {
    return this.chat.listConversations(customerId);
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string) {
    return this.chat.getConversation(id);
  }
}
