import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SettingsService } from './settings.service';

/**
 * Fully public (works before login — the app checks this at launch). Null
 * minAppVersion = gate off; the client picks the store URL for its OS.
 */
@Public()
@Controller('app/version-gate')
export class AppVersionController {
  constructor(private settings: SettingsService) {}

  @Get()
  async get() {
    const s = await this.settings.get();
    return {
      minAppVersion: s.minAppVersion ?? null,
      latestAppVersion: s.latestAppVersion ?? null,
      appStoreUrl: s.appStoreUrl ?? null,
      playStoreUrl: s.playStoreUrl ?? null,
    };
  }
}
