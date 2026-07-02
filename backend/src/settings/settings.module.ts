import { Module } from '@nestjs/common';
import { AppContactController } from './app-contact.controller';
import { AppVersionController } from './app-version.controller';
import { AppVersionGateService } from './app-version-gate.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController, AppVersionController, AppContactController],
  providers: [SettingsService, AppVersionGateService],
  exports: [SettingsService, AppVersionGateService],
})
export class SettingsModule {}
