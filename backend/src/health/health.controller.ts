import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';

// Liveness probe for the host platform (Render health check). Kept dependency-
// free and unauthenticated so the platform can poll it cheaply; excluded from
// the global `api` prefix in main.ts so it lives at `/health`, and exempt from
// rate limiting so frequent probes don't burn the IP quota.
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
