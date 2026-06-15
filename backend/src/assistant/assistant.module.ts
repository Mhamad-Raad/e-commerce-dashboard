import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantChatService } from './assistant-chat.service';
import { ClaudeProvider } from './provider/claude.provider';
import { ASSISTANT_PROVIDER } from './provider/assistant-provider.interface';

@Module({
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantChatService,
    // Swap this binding to add Gemini/OpenRouter later — the chat service only
    // depends on the AssistantProvider interface.
    { provide: ASSISTANT_PROVIDER, useClass: ClaudeProvider },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
