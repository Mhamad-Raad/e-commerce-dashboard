import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppVersionGateService } from './settings/app-version-gate.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Only trust the first proxy hop when actually deployed behind one (set
  // TRUST_PROXY=true). Trusting it otherwise would let clients spoof
  // X-Forwarded-For and bypass IP rate limiting; not trusting it behind a real
  // proxy would lump every client under the proxy IP.
  if (config.get<string>('TRUST_PROXY') === 'true') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN')?.split(',') ?? true,
    credentials: true,
  });
  // App version gate: refuse /app/* requests from outdated clients with 426
  // (after CORS so the refusal carries CORS headers; before routing).
  const versionGate = app.get(AppVersionGateService);
  app.use((req: any, res: any, next: any) => {
    void versionGate.handle(req, res, next);
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Everything is under /api except the platform health probe at /health.
  app.setGlobalPrefix('api', { exclude: ['health'] });

  const port = Number(config.get<string>('PORT') ?? 3000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}/api`);
}

bootstrap();
