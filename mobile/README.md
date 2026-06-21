# Rozhna's Store — Mobile App

Flutter customer app for the Rozhna beauty store. Talks to the existing NestJS API.
Architecture: see [`../MOBILE_ARCHITECTURE.md`](../MOBILE_ARCHITECTURE.md).

## Run

Flavored entrypoints (no `lib/main.dart`):

```bash
flutter pub get
flutter run -t lib/main_dev.dart     # dev API
flutter run -t lib/main_prod.dart    # prod API (parked)
```

## Stack
Riverpod (state + DI) · go_router (auth-gated) · Dio (+ Retrofit later) ·
google_fonts (Bodoni Moda + Plus Jakarta Sans) · flutter_secure_storage · intl.

## Layout
Feature-first under `lib/features/*`, each `data / domain / presentation`.
Shared foundation in `lib/app` (theme, router, env) and `lib/core`
(network, storage, money, error, widgets). Full tree in `MOBILE_ARCHITECTURE.md`.

## Current state (scaffold)
Runs to a branded placeholder Home with working **light/dark theme toggle**,
**auth-gated routing** (Login → Home), themed app bar, and the core plumbing
(Dio client + auth interceptor, secure token store, `Money`, sealed `Result`/`Failure`).

**Placeholders / TODO:**
- Login/Home are stubs — real screens (from the Stitch designs) come next.
- `flutter analyze` is clean; `flutter run` needs a device/emulator.

## Notes
- **Manual Riverpod providers** for now (no `@riverpod` codegen): the
  `riverpod_generator` 3.x toolchain currently conflicts with `flutter_riverpod 3.3.2`.
  freezed/json/retrofit codegen will be added per-feature when we write the first models.
- Real dev/prod API base URLs are placeholders in `lib/app/env/env.dart`.
- App-specific localized strings (`lib/l10n/*.arb` + gen-l10n) to be wired;
  Material/RTL localization already works via the global delegates.
