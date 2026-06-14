import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAssistantConfigDto } from './dto/update-assistant-config.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class AssistantService {
  constructor(private prisma: PrismaService) {}

  /** Return the assistant config, creating it with defaults on first access. */
  getConfig() {
    return this.prisma.assistantConfig.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  }

  async updateConfig(dto: UpdateAssistantConfigDto) {
    // Manually clearing `locked` should also clear the stored reason.
    const data = {
      ...dto,
      ...(dto.locked === false ? { lockedReason: null } : {}),
    };
    return this.prisma.assistantConfig.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
  }
}
