import {
  BadRequestException,
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OtpChallenge, OtpPurpose } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OTP_PROVIDER, OtpProvider } from './provider/otp-provider.interface';

// Our-side policy, enforced regardless of provider. (Twilio Verify also applies
// its own expiry/attempt limits; these mirror them so a future self-managed
// provider behaves identically.)
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // min gap between (re)sends
const MAX_RESENDS = 5; // (re)sends allowed per challenge
const MAX_ATTEMPTS = 5; // wrong-code checks before lockout

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    @Inject(OTP_PROVIDER) private provider: OtpProvider,
  ) {}

  /**
   * Send (or resend) a code for (purpose, phone). Reuses the active challenge so
   * resends respect a cooldown + cap; creates a fresh one otherwise. `customerId`
   * binds the challenge to an account for password reset (null during sign-up).
   */
  async send(
    purpose: OtpPurpose,
    phone: string,
    customerId?: string,
  ): Promise<void> {
    const active = await this.activeChallenge(purpose, phone);

    if (active) {
      const sinceLast = Date.now() - active.lastSentAt.getTime();
      if (sinceLast < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - sinceLast) / 1000);
        throw new HttpException(
          `Please wait ${wait}s before requesting another code.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (active.resendCount >= MAX_RESENDS) {
        throw new HttpException(
          'Too many code requests. Try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const { providerRef } = await this.provider.request(purpose, phone);
      await this.prisma.otpChallenge.update({
        where: { id: active.id },
        data: {
          providerRef,
          resendCount: { increment: 1 },
          attempts: 0, // a fresh code earns fresh attempts
          lastSentAt: new Date(),
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
          customerId: customerId ?? active.customerId,
        },
      });
      return;
    }

    const { providerRef } = await this.provider.request(purpose, phone);
    await this.prisma.otpChallenge.create({
      data: {
        phone,
        purpose,
        customerId,
        providerRef,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });
  }

  /**
   * Validate a code. On success the challenge is marked consumed (single-use) and
   * returned so callers can read its bound customerId. Throws on missing/expired/
   * locked/invalid.
   */
  async check(
    purpose: OtpPurpose,
    phone: string,
    code: string,
  ): Promise<OtpChallenge> {
    const challenge = await this.activeChallenge(purpose, phone);
    if (!challenge) {
      throw new BadRequestException('No active code. Request a new one.');
    }
    if (challenge.attempts >= MAX_ATTEMPTS) {
      throw new HttpException(
        'Too many incorrect attempts. Request a new code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const ok = await this.provider.verify(purpose, phone, code);
    if (!ok) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid or expired code.');
    }

    return this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
  }

  // Latest unconsumed, unexpired challenge for (phone, purpose), if any.
  private activeChallenge(purpose: OtpPurpose, phone: string) {
    return this.prisma.otpChallenge.findFirst({
      where: {
        phone,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
