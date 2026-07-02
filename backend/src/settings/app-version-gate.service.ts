import { Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 426 Upgrade Required gate for the mobile API (`/app/*`), wired as a raw
 * Express middleware in main.ts (runs before routing). Requests carrying an
 * `X-App-Version` below Settings.minAppVersion are refused so an outdated app
 * can never hit an API it may be incompatible with. Fail-open by design:
 * missing/malformed header, no configured minimum, or a settings read error all
 * pass the request through — the gate must never take the API down.
 * `/app/version-gate` itself is exempt so a blocked client can still fetch the
 * store URLs for its update screen.
 */
@Injectable()
export class AppVersionGateService {
  private cache: { min: string | null; at: number } | null = null;

  constructor(private prisma: PrismaService) {}

  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const path = req.path;
      const isAppRoute =
        path.startsWith('/api/app/') || path.startsWith('/app/');
      if (!isAppRoute || path.includes('/app/version-gate')) return next();

      const header = req.headers['x-app-version'];
      const clientVersion = parseVersion(
        typeof header === 'string' ? header : '',
      );
      if (!clientVersion) return next();

      const min = parseVersion((await this.minVersion()) ?? '');
      if (!min) return next();

      if (compareVersions(clientVersion, min) < 0) {
        res.status(426).json({
          statusCode: 426,
          error: 'UPGRADE_REQUIRED',
          message: 'A newer version of the app is required.',
        });
        return;
      }
      next();
    } catch {
      next();
    }
  }

  // One settings read per minute, not per request.
  private async minVersion(): Promise<string | null> {
    const now = Date.now();
    if (this.cache && now - this.cache.at < 60_000) return this.cache.min;
    const setting = await this.prisma.setting.findUnique({
      where: { id: 'singleton' },
      select: { minAppVersion: true },
    });
    this.cache = { min: setting?.minAppVersion ?? null, at: now };
    return this.cache.min;
  }
}

function parseVersion(v: string): [number, number, number] | null {
  const m = v.trim().match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
}

function compareVersions(
  a: [number, number, number],
  b: [number, number, number],
) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}
