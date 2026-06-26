import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  App,
  cert,
  getApps,
  initializeApp,
  ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

export interface PushPayload {
  title: string;
  body: string;
  /** Extra string key/values delivered to the app (deep-link target, ids). */
  data?: Record<string, string>;
}

export interface PushResult {
  sent: number;
  /** Tokens Firebase reported as permanently invalid — caller should prune. */
  invalidTokens: string[];
}

// Firebase error codes that mean the token is dead and must be removed.
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

/**
 * Thin wrapper over firebase-admin messaging. DORMANT until the FIREBASE_* env
 * vars are set (same posture as UploadsService/R2): when unconfigured it logs a
 * warning once and every send is a no-op, so dev and prod run fine without push
 * configured. Set the three env vars and restart to activate — no code change.
 */
@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly app: App | null;

  constructor(private readonly config: ConfigService) {
    this.app = this.initApp();
    if (!this.app) {
      this.logger.warn(
        'Firebase is not configured (missing FIREBASE_* env vars) — push notifications are disabled.',
      );
    }
  }

  get enabled(): boolean {
    return this.app !== null;
  }

  private initApp(): App | null {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    // Private keys are stored with literal "\n" in env; restore real newlines.
    const privateKey = this.config
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) return null;

    // Reuse an already-initialised default app if one exists (hot reload / tests).
    const existing = getApps()[0];
    if (existing) return existing;

    try {
      const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };
      return initializeApp({ credential: cert(serviceAccount) });
    } catch (err) {
      this.logger.error(`Failed to initialise Firebase Admin: ${String(err)}`);
      return null;
    }
  }

  private messaging(): Messaging | null {
    return this.app ? getMessaging(this.app) : null;
  }

  /**
   * Send one notification to many device tokens. Never throws — returns which
   * tokens are dead so the caller can prune them. No-op (sent: 0) when dormant.
   */
  async sendToTokens(tokens: string[], payload: PushPayload): Promise<PushResult> {
    const messaging = this.messaging();
    if (!messaging || tokens.length === 0) {
      return { sent: 0, invalidTokens: [] };
    }

    try {
      const res = await messaging.sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        android: { priority: 'high', notification: { sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });

      const invalidTokens: string[] = [];
      res.responses.forEach((r, i) => {
        if (!r.success && r.error && DEAD_TOKEN_CODES.has(r.error.code)) {
          invalidTokens.push(tokens[i]);
        }
      });
      if (res.failureCount > 0) {
        this.logger.warn(
          `FCM: ${res.successCount} sent, ${res.failureCount} failed (${invalidTokens.length} dead tokens to prune)`,
        );
      }
      return { sent: res.successCount, invalidTokens };
    } catch (err) {
      // A transport-level failure shouldn't break the calling request.
      this.logger.error(`FCM send failed: ${String(err)}`);
      return { sent: 0, invalidTokens: [] };
    }
  }
}
