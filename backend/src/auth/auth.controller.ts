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

  // When the SPA and API are served from different sites (e.g. Cloudflare Pages
  // + Cloud Run), the browser only attaches the refresh cookie to the
  // cross-site /auth/refresh call if it is SameSite=None; Secure. SameSite=None
  // mandates Secure, which mandates HTTPS — fine in prod, but unusable over
  // plain-HTTP localhost, so dev stays on Lax. Overridable via COOKIE_SAMESITE
  // for same-domain deploys that can keep Lax.
  private refreshCookieOptions() {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const sameSite =
      (this.config.get<string>('COOKIE_SAMESITE') as
        | 'lax'
        | 'strict'
        | 'none'
        | undefined) ?? (isProd ? 'none' : 'lax');
    return {
      httpOnly: true,
      secure: isProd,
      sameSite,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    } as const;
  }
}
