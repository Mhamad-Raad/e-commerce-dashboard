import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  // A throwaway hash so login always runs bcrypt even when the email is unknown,
  // equalizing response time so attackers can't enumerate valid emails by timing.
  private readonly dummyHash = bcrypt.hashSync('login-timing-placeholder', 12);
  // Refresh cookies are shared across tabs; a cookie rotated out moments ago
  // is usually another tab racing this one, not theft.
  private readonly rotateGraceMs = 60_000;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? this.dummyHash);
    if (!user || !ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    await this.storeRefreshHash(user.id, tokens.refreshToken);

    return {
      tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async refresh(userId: string, presentedToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshHash) throw new ForbiddenException('Access denied');

    const digest = this.digest(presentedToken);
    const matchesCurrent = await bcrypt.compare(digest, user.refreshHash);
    const matchesPrevInGrace =
      !matchesCurrent &&
      user.prevRefreshHash !== null &&
      user.refreshRotatedAt !== null &&
      Date.now() - user.refreshRotatedAt.getTime() < this.rotateGraceMs &&
      (await bcrypt.compare(digest, user.prevRefreshHash));
    if (!matchesCurrent && !matchesPrevInGrace) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    await this.storeRefreshHash(user.id, tokens.refreshToken, user.refreshHash);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshHash: null, prevRefreshHash: null, refreshRotatedAt: null },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private async issueTokens(sub: string, email: string, role: string) {
    const payload: JwtPayload = { sub, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_ACCESS_TTL'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_TTL'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  // On rotation the outgoing hash is kept as prev for the grace window; a
  // fresh login starts clean.
  private async storeRefreshHash(
    userId: string,
    refreshToken: string,
    rotatedFromHash?: string | null,
  ) {
    const refreshHash = await bcrypt.hash(this.digest(refreshToken), 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: rotatedFromHash
        ? { refreshHash, prevRefreshHash: rotatedFromHash, refreshRotatedAt: new Date() }
        : { refreshHash, prevRefreshHash: null, refreshRotatedAt: null },
    });
  }

  // Collapse the token to a fixed-length SHA-256 hex digest before bcrypt.
  // bcrypt only hashes the first 72 bytes of its input, and every JWT for a
  // given user shares an identical 72-byte prefix (header + "sub" claim), so
  // hashing the raw token would make all of a user's refresh tokens collide.
  private digest(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
