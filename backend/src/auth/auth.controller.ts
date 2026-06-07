import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { CurrentUser, CurrentUserPayload } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  // Tight brute-force guard: 5 login attempts / minute / IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.auth.login(dto.email, dto.password);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, user };
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth.refresh(user.id, user.refreshToken!);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(user.id);
    const { maxAge: _maxAge, ...clearOpts } = this.refreshCookieOptions();
    res.clearCookie(REFRESH_COOKIE, clearOpts);
    return { success: true };
  }

  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.me(user.id);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, this.refreshCookieOptions());
  }

  // Cookie security is driven by explicit flags, NOT by NODE_ENV, so the
  // environment label (development/staging/production) is free to be anything.
  // When the SPA and API are on different sites (e.g. Cloudflare Pages + Render),
  // the browser only attaches the refresh cookie to the cross-site
  // /auth/refresh call if it is SameSite=None — and it only stores a
  // SameSite=None cookie when it is ALSO Secure. So: set COOKIE_SAMESITE=none on
  // any cross-site HTTPS deploy and Secure is forced on automatically. Plain
  // localhost leaves both unset → Lax + non-Secure, which works over HTTP.
  private refreshCookieOptions() {
    const sameSite =
      (this.config.get<string>('COOKIE_SAMESITE') as
        | 'lax'
        | 'strict'
        | 'none'
        | undefined) ?? 'lax';
    // SameSite=None mandates Secure; otherwise honour COOKIE_SECURE (set it on
    // any HTTPS deploy that keeps Lax).
    const secure =
      sameSite === 'none' || this.config.get<string>('COOKIE_SECURE') === 'true';
    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    } as const;
  }
}
