# Mobile app — "Rozhna's Store"

Customer‑facing **Flutter** app (Android + iOS, one Dart codebase) at `mobile/` (package `rozhna_store`). Designed from the **Rozhna Radiance** Google Stitch project (berry/rose `#ba0048`, champagne gold, Bodoni Moda serif headlines + Plus Jakarta Sans body, rounded 16px cards, pill buttons, frosted bottom nav). Deep architecture: [`../MOBILE_ARCHITECTURE.md`](../MOBILE_ARCHITECTURE.md).

## Stack & conventions

- **State + DI:** Riverpod (manual providers — no codegen). **Routing:** go_router with an auth‑redirect guard. **HTTP:** Dio + auth interceptor. **Storage:** `flutter_secure_storage` (tokens) + `shared_preferences` (theme/locale). **Sealed `Result<T>` / `Failure`** from the data layer; screens use `AsyncValue`.
- **Design tokens** centralized: `AppColors` (via `ColorScheme` — no raw brand colors in widgets), `AppTypography`, `AppSpacing`, `AppRadii`, `AppSizes`.
- **Light + dark** themes; **EN / AR / Kurdish Sorani** with RTL (see [i18n](internationalization.md)).
- Run: `flutter run -t lib/main_dev.dart` (dev) — dev points at the local backend `http://10.0.2.2:3000/api` (Android emulator → host); debug builds allow cleartext.

## Feature structure (`mobile/lib/features/`)

- **`auth/`** — phone+password + OTP flow ([customer auth](customer-auth.md)): login / signup / OTP / forgot / reset, session restore, refresh‑rotation interceptor.
- **`catalog/`** — the [home](home-builder.md): `HomeScreen` + `HomeSectionView` dispatcher + per‑type section widgets + reusable `ProductCard`, `CircleTile`, `HeroCarousel`, `PillBadge`, `AppNetworkImage`, shimmer skeletons.
- **`blog/`** — [stories](blog.md) reader.
- **`account/`** — Profile tab (language switcher, theme toggle, logout).
- **`search/`** — tab stub.

App shell: `MainShell` with a **frosted‑glass bottom nav** (Home / Shop / Search / Profile) via `StatefulShellRoute`. Shop/Search are stubs; product detail, category PLP, and store pages are pending (home taps to those show "coming soon").

## Notable build decisions

- **Manual Riverpod providers** (riverpod_generator 3.x conflicts with flutter_riverpod 3.3.2); freezed/json/retrofit codegen deferred.
- Android `minSdk = 23` (flutter_secure_storage 10). iOS can only be **built on macOS**.
- **Push (FCM)** and the **in‑app AI assistant chat UI** are planned, not yet built.
