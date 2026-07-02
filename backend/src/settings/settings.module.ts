import { Module } from '@nestjs/common';
import { AppVersionController } from './app-version.controller';
import { AppVersionGateService } from './app-version-gate.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController, AppVersionController],
  providers: [SettingsService, AppVersionGateService],
  exports: [SettingsService, AppVersionGateService],
})
export class SettingsModule {}
