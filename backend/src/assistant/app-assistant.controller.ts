import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentCustomer,
  CurrentCustomerPayload,
} from '../customer-auth/decorators/current-customer.decorator';
import { CustomerJwtGuard } from '../customer-auth/guards/customer-jwt.guard';
import { AssistantChatService } from './assistant-chat.service';
import { AppChatDto } from './dto/app-chat.dto';

// The shopping assistant for the mobile app. Scoped to the authenticated
// customer via the customer JWT — the customer is resolved server-side from the
// token, never from the body (unlike the admin AssistantController). @Public()
// so the global admin guard skips it; CustomerJwtGuard runs instead. Stays
// dormant (503) until ANTHROPIC_API_KEY is configured.
@Public()
@UseGuards(CustomerJwtGuard)
@Controller('app/assistant')
export class AppAssistantController {
  constructor(private chat: AssistantChatService) {}

  // CPU-heavy + paid, so throttle harder than the global limit.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('chat')
  send(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Body() dto: AppChatDto,
  ) {
    return this.chat.chatForCustomer(customer.id, dto);
  }

  @Get('conversations')
  listConversations(@CurrentCustomer() customer: CurrentCustomerPayload) {
    return this.chat.listConversations(customer.id);
  }

  @Get('conversations/:id')
  getConversation(
    @CurrentCustomer() customer: CurrentCustomerPayload,
    @Param('id') id: string,
  ) {
    return this.chat.getConversationForCustomer(customer.id, id);
  }
}
