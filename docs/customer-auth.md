# Customer authentication (mobile app)

Net‑new authentication for the **customer mobile app**, separate from the admin auth (admin uses email/password + an httpOnly refresh cookie). Customers authenticate with **phone number + password**; **WhatsApp OTP only verifies the number** — it is not a login method. **No guest checkout** — cart/checkout is login‑gated.

Backend lives in `backend/src/customer-auth/` and `backend/src/otp/`, under the route prefix **`/api/app/auth`**.

## Endpoints (`/api/app/auth`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/register` | name + phone + password (+ optional email) → create unverified customer, send `PHONE_VERIFICATION` OTP |
| POST | `/verify-phone` | phone + code → set `phoneVerifiedAt`, **auto‑login** (tokens + customer) |
| POST | `/resend-otp` | phone + purpose → throttled resend (existence‑blind) |
| POST | `/login` | phone + password → tokens; `403 PHONE_NOT_VERIFIED` if unverified (re‑sends a code) |
| POST | `/forgot-password` | phone → send `PASSWORD_RESET` OTP — **always 200** (never reveals whether a number exists) |
| POST | `/reset-password` | phone + code + newPassword → set password, **revoke all sessions** |
| POST | `/refresh` | refreshToken → **rotate** (new access + refresh); replaying a rotated token revokes the whole session family |
| POST | `/logout` | optional refreshToken → revoke this device (or all if omitted) — bearer‑gated |
| GET | `/me` | current customer — bearer‑gated |

## Data model

- **`Customer`** gained `phone @unique`, `passwordHash`, `phoneVerifiedAt` (and `email` became optional — the app is phone‑first). Phone is stored normalized to **E.164 `+9647XXXXXXXXX`** (Iraqi mobiles only).
- **`OtpChallenge`** — one table for every `OtpPurpose` (`PHONE_VERIFICATION`, `PASSWORD_RESET`): destination phone, hashed/provider‑held code, expiry, attempt + resend caps, audit. `customerId` binds it to an account for reset.
- **`CustomerSession`** — per‑device refresh tokens with **rotation + reuse detection** (`familyId`); only the sha‑256 of the token is stored.

## Tokens

- **Access** = JWT signed with its own `CUSTOMER_JWT_ACCESS_SECRET` and a `typ: 'customer'` claim, so a customer token can never satisfy admin routes (and vice‑versa).
- **Refresh** = opaque random token; only its sha‑256 is stored. Rotation on every `/refresh`; presenting an already‑rotated token revokes the whole family (forced re‑login). Mobile stores both in `flutter_secure_storage` (no cookies).

## OTP delivery (provider seam)

WhatsApp OTP sits behind an `OtpProvider` interface (`backend/src/otp/provider/`):

- **v1 = Twilio Verify** (WhatsApp channel) — managed code lifecycle. Dormant until `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_VERIFY_SERVICE_SID` are set.
- **Dev fallback = `LogOtpProvider`** — when Twilio isn't configured it **prints the code to the server console**, so local dev needs no Twilio account.
- **Cost roadmap:** migrate to **Meta WhatsApp Cloud API direct** (~15× cheaper per message for Iraq) past ~1k verifications/month by adding a `MetaCloudOtpProvider` — no endpoint/DTO/DB change (the `OtpChallenge.codeHash` column is pre‑staged for it).

> ⚠️ **WhatsApp sender setup is required for production** — Twilio Verify WhatsApp needs an approved WhatsApp Business sender (Meta Business Manager + a dedicated number not already on WhatsApp). Local dev uses the console‑code fallback.

## Security notes

- **Existence‑blind**: `forgot-password` / `resend-otp` always return 200, and a resend cooldown or provider outage is swallowed so it can't be used to probe which numbers exist.
- bcrypt timing equalization on login; codes never stored plaintext; 5‑min OTP expiry, attempt caps, resend cooldown; password reset/change revokes all sessions.
- Daily `@Cron` prunes expired `OtpChallenge` + `CustomerSession` rows.

## Mobile side

Flutter feature `mobile/lib/features/auth/` (+ `core/network/auth_interceptor.dart`): data layer (`Result<T>`), `AuthController`/`AuthState` with launch session‑restore via `/me`, a Dio **refresh‑on‑401 interceptor** (rotation + single‑flight + retry‑once), and skeleton‑first screens (login / signup / OTP / forgot / reset). Sign‑up routes an already‑registered number to **login** (not OTP) on a 409 — no wasted verification cost.
