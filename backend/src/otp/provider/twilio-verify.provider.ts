import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from '@prisma/client';
import { OtpProvider } from './otp-provider.interface';

/**
 * Twilio Verify (v2) over WhatsApp. Twilio owns the code lifecycle — generation,
 * 10-min expiry, attempt limits, fraud — so we never store the code. Talks to the
 * REST API directly with global fetch to avoid pulling in the Twilio SDK.
 *
 * Dormant until TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_VERIFY_SERVICE_SID
 * are set; OtpModule falls back to LogOtpProvider otherwise.
 */
@Injectable()
export class TwilioVerifyOtpProvider implements OtpProvider {
  private readonly logger = new Logger(TwilioVerifyOtpProvider.name);
  private readonly accountSid?: string;
  private readonly authToken?: string;
  private readonly serviceSid?: string;

  constructor(config: ConfigService) {
    this.accountSid = config.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = config.get<string>('TWILIO_AUTH_TOKEN');
    this.serviceSid = config.get<string>('TWILIO_VERIFY_SERVICE_SID');
    if (!this.isConfigured()) {
      this.logger.warn('Twilio Verify not configured — OTP delivery is dormant.');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.accountSid && this.authToken && this.serviceSid);
  }

  async request(
    _purpose: OtpPurpose,
    phone: string,
  ): Promise<{ providerRef?: string }> {
    const body = await this.call('Verifications', {
      To: phone,
      Channel: 'whatsapp',
    });
    return { providerRef: typeof body.sid === 'string' ? body.sid : undefined };
  }

  async verify(
    _purpose: OtpPurpose,
    phone: string,
    code: string,
  ): Promise<boolean> {
    // A 404 here means no pending verification (expired / already used) — that is
    // a failed check, not a server error, so call() returns null instead of throwing.
    const body = await this.call(
      'VerificationCheck',
      { To: phone, Code: code },
      true,
    );
    return body?.status === 'approved';
  }

  private async call(
    resource: 'Verifications' | 'VerificationCheck',
    fields: Record<string, string>,
    notFoundIsNull = false,
  ): Promise<Record<string, unknown>> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('OTP delivery is not configured.');
    }
    const url = `https://verify.twilio.com/v2/Services/${this.serviceSid}/${resource}`;
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(fields).toString(),
    });

    if (res.status === 404 && notFoundIsNull) {
      return { status: 'not_found' };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Twilio ${resource} failed (${res.status}): ${text}`);
      throw new ServiceUnavailableException('Could not send the verification code.');
    }
    return (await res.json()) as Record<string, unknown>;
  }
}
