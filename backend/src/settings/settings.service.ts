import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

const SINGLETON_ID = 'singleton';

// Map ''/whitespace values of the given keys to null (clears nullable columns).
function emptyToNull<T extends object>(dto: T, keys: (keyof T)[]) {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = dto[key];
    if (typeof value === 'string' && value.trim() === '') out[key as string] = null;
  }
  return out;
}

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
      // Empty string = clear the field (nullable gate fields switch off).
      ...emptyToNull(dto, [
        'minAppVersion',
        'latestAppVersion',
        'appStoreUrl',
        'playStoreUrl',
        'socialInstagram',
        'socialFacebook',
        'socialTiktok',
        'socialSnapchat',
        'socialYoutube',
        'socialX',
        'socialWhatsapp',
      ]),
    };
    return this.prisma.setting.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
  }
}
