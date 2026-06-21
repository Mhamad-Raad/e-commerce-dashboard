import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { OTP_PROVIDER } from './provider/otp-provider.interface';
import { LogOtpProvider } from './provider/log-otp.provider';
import { TwilioVerifyOtpProvider } from './provider/twilio-verify.provider';

@Module({
  providers: [
    OtpService,
    TwilioVerifyOtpProvider,
    LogOtpProvider,
    // Use Twilio Verify when credentials are present; otherwise fall back to the
    // console-logging dev provider so local dev needs no Twilio account. To move
    // to the cheaper Meta WhatsApp Cloud API later, add a MetaCloudOtpProvider
    // and return it here (see otp-provider.interface.ts — OTP COST ROADMAP).
    {
      provide: OTP_PROVIDER,
      inject: [ConfigService, TwilioVerifyOtpProvider, LogOtpProvider],
      useFactory: (
        config: ConfigService,
        twilio: TwilioVerifyOtpProvider,
        log: LogOtpProvider,
      ) => (twilio.isConfigured() ? twilio : log),
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
