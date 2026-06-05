import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /** Return the settings row, creating it with defaults on first access. */
  get() {
    return this.prisma.setting.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  }

  update(dto: UpdateSettingsDto) {
    const data = {
      ...dto,
      ...(dto.defaultCurrency
        ? { defaultCurrency: dto.defaultCurrency.toUpperCase() }
        : {}),
    };
    return this.prisma.setting.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
  }
}
