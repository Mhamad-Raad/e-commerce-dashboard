import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { OtpPurpose } from '@prisma/client';
import { OtpProvider } from './otp-provider.interface';

/**
 * Dev / dormant fallback used when Twilio is not configured — mirrors the
 * assistant's "dormant until the key is set" pattern. It generates a 6-digit
 * code, logs it to the server console, and keeps it in memory so /verify works
 * end-to-end locally with no Twilio account. NEVER selected when Twilio creds
 * are present (see OtpModule provider factory). Not for production.
 */
@Injectable()
export class LogOtpProvider implements OtpProvider {
  private readonly logger = new Logger(LogOtpProvider.name);
  // key = `${purpose}:${phone}` → code. In-memory only; fine for single-process dev.
  private readonly codes = new Map<string, string>();

  isConfigured(): boolean {
    return true; // always "works" in dev
  }

  request(purpose: OtpPurpose, phone: string): Promise<{ providerRef?: string }> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    this.codes.set(this.key(purpose, phone), code);
    this.logger.warn(
      `Twilio not configured — DEV OTP for ${phone} (${purpose}): ${code}`,
    );
    return Promise.resolve({ providerRef: 'dev-log' });
  }

  verify(purpose: OtpPurpose, phone: string, code: string): Promise<boolean> {
    const key = this.key(purpose, phone);
    const ok = this.codes.get(key) === code;
    if (ok) this.codes.delete(key);
    return Promise.resolve(ok);
  }

  private key(purpose: OtpPurpose, phone: string): string {
    return `${purpose}:${phone}`;
  }
}
