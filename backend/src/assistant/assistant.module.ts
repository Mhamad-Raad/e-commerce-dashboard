import { Module } from '@nestjs/common';
import { AppAssistantController } from './app-assistant.controller';
import { GuestAssistantController } from './guest-assistant.controller';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantChatService } from './assistant-chat.service';
import { AssistantToolsService } from './assistant-tools.service';
import { ClaudeProvider } from './provider/claude.provider';
import { ASSISTANT_PROVIDER } from './provider/assistant-provider.interface';

@Module({
  controllers: [AssistantController, AppAssistantController, GuestAssistantController],
  providers: [
    AssistantService,
    AssistantChatService,
    AssistantToolsService,
    // Swap this binding to add Gemini/OpenRouter later — the chat service only
    // depends on the AssistantProvider interface.
    { provide: ASSISTANT_PROVIDER, useClass: ClaudeProvider },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
