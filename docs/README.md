# Rozhna — Project Wiki

Rozhna is an Iraqi beauty‑resell storefront (started single‑seller) with three parts:

| Part | Stack | Location |
|---|---|---|
| **Backend API** | NestJS + Prisma + PostgreSQL | `backend/` |
| **Admin dashboard** | React + Vite + TS + Tailwind v4 + shadcn/ui + TanStack Query | `frontend/` |
| **Customer mobile app** ("Rozhna's Store") | Flutter (Riverpod + go_router + Dio) | `mobile/` |

The mobile app does checkout against the API; the dashboard manages catalog, customers, orders, the **home layout**, **stories/blog**, and reporting.

## Wiki pages

- **[Customer auth](customer-auth.md)** — phone + password login, WhatsApp OTP verification, refresh‑token rotation.
- **[Home builder](home-builder.md)** — dashboard‑composed, server‑driven home (drag‑drop sections + live preview) rendered by the app.
- **[Internationalization](internationalization.md)** — trilingual content (English + Arabic + Kurdish Sorani) across API, app, and dashboard.
- **[Blog / Stories](blog.md)** — editorial posts surfaced on the home and read in‑app.
- **[Mobile app](mobile-app.md)** — Flutter app overview (deep architecture in [`../MOBILE_ARCHITECTURE.md`](../MOBILE_ARCHITECTURE.md)).
- **[AI assistant](assistant.md)** — in‑app shopping assistant (dormant until an API key is set).

## Conventions (all surfaces)

- **Money** is integer minor units; **IQD = whole dinars** (0 decimals). No float math on money.
- **Content is trilingual** — English is the canonical/required value; Arabic and Kurdish Sorani are optional and fall back to English. See [internationalization](internationalization.md).
- **Commit straight to `main`** (no feature branches).
- Backend: `npm run start:dev` (`:3000/api`). Dashboard: `npm run dev` (`:5173`). App: `flutter run -t lib/main_dev.dart`.

## Deployment

Dev/staging is live on **Neon + Render + Vercel**; the project is intentionally **dev‑only / prod parked** (no prod R2 or `ANTHROPIC_API_KEY` set). Image storage is Cloudflare R2 (dev bucket).
