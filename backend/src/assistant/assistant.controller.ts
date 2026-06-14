import { Body, Controller, Get, Patch } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { UpdateAssistantConfigDto } from './dto/update-assistant-config.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private assistant: AssistantService) {}

  @Get('config')
  getConfig() {
    return this.assistant.getConfig();
  }

  @Patch('config')
  updateConfig(@Body() dto: UpdateAssistantConfigDto) {
    return this.assistant.updateConfig(dto);
  }
}
