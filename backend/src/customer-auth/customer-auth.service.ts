import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { Customer, OtpPurpose, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { normalizeIraqiPhone } from '../otp/phone.util';
import { CustomerJwtPayload } from './strategies/customer-jwt.strategy';

interface SessionContext {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);
  // Run bcrypt even when the phone is unknown so login timing can't be used to
  // enumerate registered numbers (mirrors the admin AuthService).
  private readonly dummyHash = bcrypt.hashSync('login-timing-placeholder', 12);
  private readonly refreshTtlMs: number;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otp: OtpService,
  ) {
    const days = Number(this.config.get('CUSTOMER_REFRESH_TTL_DAYS'));
    const validDays = Number.isFinite(days) && days > 0 ? days : 30;
    this.refreshTtlMs = validDays * 24 * 60 * 60 * 1000;
  }

  // ── Sign up ──────────────────────────────────────────────────────────────
  async register(input: {
    name: string;
    phone: string;
    password: string;
    email?: string;
  }) {
    const phone = this.requirePhone(input.phone);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const existing = await this.prisma.customer.findUnique({ where: { phone } });
    if (existing?.phoneVerifiedAt) {
      throw new ConflictException('This phone number is already registered.');
    }

    try {
      if (existing) {
        // Re-registration of an unverified number overwrites the stale record.
        await this.prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            email: input.email ?? existing.email,
            passwordHash,
          },
        });
      } else {
        await this.prisma.customer.create({
          data: { name: input.name, phone, email: input.email, passwordHash },
        });
      }
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        // A concurrent sign-up could trip the phone unique index between our
        // check and the write — report the right field rather than guessing email.
        const target = Array.isArray(err.meta?.target)
          ? (err.meta.target as string[])
          : [];
        if (target.includes('phone')) {
          throw new ConflictException('This phone number is already registered.');
        }
        throw new ConflictException('That email is already in use.');
      }
      throw err;
    }

    await this.otp.send(OtpPurpose.PHONE_VERIFICATION, phone);
    return { phone, status: 'verification_sent' as const };
  }

  // Verify the WhatsApp number, then auto-login.
  async verifyPhone(input: { phone: string; code: string }, ctx: SessionContext) {
    const phone = this.requirePhone(input.phone);
    await this.otp.check(OtpPurpose.PHONE_VERIFICATION, phone, input.code);

    const customer = await this.prisma.customer.findUnique({ where: { phone } });
    if (!customer) throw new BadRequestException('No account for this number.');
    if (!customer.isActive) throw new ForbiddenException('This account is disabled.');

    const verified =
      customer.phoneVerifiedAt
        ? customer
        : await this.prisma.customer.update({
            where: { id: customer.id },
            data: { phoneVerifiedAt: new Date() },
          });

    const tokens = await this.issueSession(verified.id, ctx);
    return { ...tokens, customer: this.publicCustomer(verified) };
  }

  // ── Login ────────────────────────────────────────────────────────────────
  async login(input: { phone: string; password: string }, ctx: SessionContext) {
    const phone = normalizeIraqiPhone(input.phone);
    const customer = phone
      ? await this.prisma.customer.findUnique({ where: { phone } })
      : null;

    const ok = await bcrypt.compare(
      input.password,
      customer?.passwordHash ?? this.dummyHash,
    );
    if (!customer || !customer.passwordHash || !ok || !customer.isActive) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    if (!customer.phoneVerifiedAt) {
      // Account exists but was never verified — re-send a code and tell the
      // client to route to the OTP screen. safeSend so a resend cooldown can't
      // mask the actionable 403 with a 429.
      await this.safeSend(OtpPurpose.PHONE_VERIFICATION, customer.phone!, customer.id);
      throw new ForbiddenException({
        message: 'Phone number not verified. We sent you a new code.',
        code: 'PHONE_NOT_VERIFIED',
      });
    }

    const tokens = await this.issueSession(customer.id, ctx);
    return { ...tokens, customer: this.publicCustomer(customer) };
  }

  // ── Forgot / reset password ───────────────────────────────────────────────
  // Existence-blind: always resolves, so callers can't probe which numbers exist.
  async forgotPassword(input: { phone: string }) {
    const phone = normalizeIraqiPhone(input.phone);
    if (phone) {
      const customer = await this.prisma.customer.findUnique({ where: { phone } });
      if (customer?.phoneVerifiedAt && customer.isActive) {
        await this.safeSend(OtpPurpose.PASSWORD_RESET, phone, customer.id);
      }
    }
    return { status: 'ok' as const };
  }

  async resetPassword(input: { phone: string; code: string; newPassword: string }) {
    const phone = this.requirePhone(input.phone);
    await this.otp.check(OtpPurpose.PASSWORD_RESET, phone, input.code);

    const customer = await this.prisma.customer.findUnique({ where: { phone } });
    if (!customer) throw new BadRequestException('No account for this number.');

    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash },
    });
    // Force re-login everywhere after a password change.
    await this.revokeAllSessions(customer.id);
    return { status: 'ok' as const };
  }

  // Resend a code for either purpose; existence-blind.
  async resendOtp(input: { phone: string; purpose: OtpPurpose }) {
    const phone = normalizeIraqiPhone(input.phone);
    if (phone) {
      const customer = await this.prisma.customer.findUnique({ where: { phone } });
      if (input.purpose === OtpPurpose.PHONE_VERIFICATION) {
        if (customer && !customer.phoneVerifiedAt) {
          await this.safeSend(OtpPurpose.PHONE_VERIFICATION, phone, customer.id);
        }
      } else if (customer?.phoneVerifiedAt && customer.isActive) {
        await this.safeSend(OtpPurpose.PASSWORD_RESET, phone, customer.id);
      }
    }
    return { status: 'ok' as const };
  }

  // ── Refresh (rotation + reuse detection) ──────────────────────────────────
  async refresh(rawToken: string, ctx: SessionContext) {
    const tokenHash = this.hash(rawToken);
    const session = await this.prisma.customerSession.findUnique({
      where: { tokenHash },
    });
    if (!session) throw new UnauthorizedException('Invalid session.');

    if (session.revokedAt) {
      // A token that was already rotated out is being replayed → likely theft.
      // Revoke the entire family so neither party can continue.
      await this.prisma.customerSession.updateMany({
        where: { familyId: session.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Session reuse detected. Please log in again.');
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await this.prisma.customerSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: session.customerId },
    });
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('Account unavailable.');
    }

    // Rotate: revoke the presented token, mint a new one in the same family.
    await this.prisma.customerSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    return this.issueSession(customer.id, ctx, session.familyId);
  }

  async logout(customerId: string, rawToken?: string) {
    if (rawToken) {
      const session = await this.prisma.customerSession.findUnique({
        where: { tokenHash: this.hash(rawToken) },
      });
      // Only revoke if the token actually belongs to this customer.
      if (session && session.customerId === customerId) {
        await this.prisma.customerSession.updateMany({
          where: { familyId: session.familyId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        return { status: 'ok' as const };
      }
    }
    await this.revokeAllSessions(customerId);
    return { status: 'ok' as const };
  }

  async me(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer || !customer.isActive) throw new UnauthorizedException();
    return this.publicCustomer(customer);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Send a code without letting failures surface. Existence-blind endpoints rely
  // on this: a resend cooldown (429) or provider outage (503) on a real number
  // must not produce a different response than a no-op on an unknown number.
  private async safeSend(
    purpose: OtpPurpose,
    phone: string,
    customerId?: string,
  ): Promise<void> {
    try {
      await this.otp.send(purpose, phone, customerId);
    } catch (err) {
      this.logger.warn(
        `OTP send failed (${purpose}, ${phone}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  // Housekeeping: drop sessions a week past expiry (revoked ones still carry an
  // expiresAt, so they age out too). Keeps the table from growing unbounded.
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async pruneExpiredSessions(): Promise<void> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.customerSession.deleteMany({
      where: { expiresAt: { lt: cutoff } },
    });
    if (count) this.logger.log(`Pruned ${count} expired customer session(s).`);
  }

  private async issueSession(
    customerId: string,
    ctx: SessionContext,
    familyId?: string,
  ) {
    const payload: CustomerJwtPayload = { sub: customerId, typ: 'customer' };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('CUSTOMER_JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('CUSTOMER_ACCESS_TTL') ?? '15m',
    });

    // Opaque refresh token; only its hash is stored. The DB row is the source of
    // truth for rotation/reuse, so it does not need to be a signed JWT.
    const refreshToken = randomBytes(32).toString('base64url');
    await this.prisma.customerSession.create({
      data: {
        customerId,
        familyId: familyId ?? randomUUID(),
        tokenHash: this.hash(refreshToken),
        userAgent: ctx.userAgent,
        ip: ctx.ip,
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });

    return { accessToken, refreshToken };
  }

  private revokeAllSessions(customerId: string) {
    return this.prisma.customerSession.updateMany({
      where: { customerId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private requirePhone(raw: string): string {
    const phone = normalizeIraqiPhone(raw);
    if (!phone) {
      throw new BadRequestException('Enter a valid Iraqi mobile number.');
    }
    return phone;
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private publicCustomer(c: Customer) {
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      avatarUrl: c.avatarUrl,
      phoneVerifiedAt: c.phoneVerifiedAt,
    };
  }
}
