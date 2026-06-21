import { OtpPurpose } from '@prisma/client';

/**
 * Provider-agnostic surface for sending and checking one-time codes.
 *
 * Division of responsibility: OtpService owns everything that is *ours* and
 * provider-independent — the OtpChallenge row, resend cooldown, max-resends,
 * attempt caps, single-active-challenge, purpose/customer binding, and audit.
 * A provider owns only code *delivery* and code *correctness*.
 *
 * v1 implementation = TwilioVerifyOtpProvider: Twilio generates, stores, expires
 * and checks the code (codeHash stays NULL on our row). Fastest to launch — no
 * WhatsApp template approval, no WhatsApp Business Account to run.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * OTP COST ROADMAP — migrate to the cheaper option later (no caller/DB change):
 *
 *   Twilio Verify (now)  ≈ $0.05 per successful verification, fully managed.
 *   Meta WhatsApp Cloud API (direct, later) ≈ $0.0034 per message for Iraq
 *   ("Rest of Middle East" tier), no platform fee — ~15x cheaper per message.
 *
 * When monthly volume passes ~1,000 verifications, add a MetaCloudOtpProvider
 * implementing THIS interface and swap the OTP_PROVIDER binding in OtpModule.
 * Meta has no managed-Verify equivalent, so that provider self-manages the code
 * lifecycle: it generates the code, stores its sha-256 in OtpChallenge.codeHash
 * (the column already exists for exactly this), enforces expiry off the row, and
 * checks the code locally. No endpoint, DTO, service-caller, or schema change is
 * required — only the DI binding and Meta credentials.
 * ──────────────────────────────────────────────────────────────────────────
 */
export interface OtpProvider {
  /** False when credentials are missing — see LogOtpProvider dev fallback. */
  isConfigured(): boolean;

  /**
   * Deliver a fresh code to `phone` over WhatsApp. `purpose` is passed for
   * provider-side context/audit; the destination keying is the phone number.
   * Returns an optional provider reference (e.g. Twilio Verification SID).
   */
  request(purpose: OtpPurpose, phone: string): Promise<{ providerRef?: string }>;

  /** Resolve true iff `code` is the valid, unexpired code for `phone`. */
  verify(purpose: OtpPurpose, phone: string, code: string): Promise<boolean>;
}

export const OTP_PROVIDER = Symbol('OTP_PROVIDER');
