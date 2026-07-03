import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SettingsService } from './settings.service';

/**
 * Public business contact details for the app's Contact-us screen, sourced from
 * the dashboard-editable Settings singleton. Null fields simply hide their row.
 */
@Public()
@Controller('app/contact')
export class AppContactController {
  constructor(private settings: SettingsService) {}

  @Get()
  async get() {
    const s = await this.settings.get();
    return {
      businessName: s.businessName ?? null,
      phone: s.businessPhone ?? null,
      email: s.businessEmail ?? null,
      address: s.businessAddress ?? null,
      // Social channels; whatsapp is a number (wa.me), the rest profile URLs.
      whatsapp: s.socialWhatsapp ?? null,
      instagram: s.socialInstagram ?? null,
      facebook: s.socialFacebook ?? null,
      tiktok: s.socialTiktok ?? null,
      snapchat: s.socialSnapchat ?? null,
      youtube: s.socialYoutube ?? null,
      x: s.socialX ?? null,
    };
  }
}
