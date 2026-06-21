# Rozhna's Store — Flutter App Architecture

> Customer-facing mobile app for the Rozhna beauty store. Talks to the existing
> **NestJS + Prisma + Postgres** API (the admin dashboard's backend). Designed from
> the **Rozhna Radiance** Stitch project.
>
> This file lives in the dashboard repo for now as a planning artifact; it becomes
> `ARCHITECTURE.md` at the root of the Flutter repo once that repo is created.

---

## 1. Principles

1. **Feature-first, layered.** Group by feature (`cart`, `checkout`…); inside each, split `presentation → domain → data`. The dependency arrow only points downward.
2. **No exceptions above the data layer.** Repositories return a typed `Result<T>` (Success | Failure). The UI never sees a raw `DioException`.
3. **No raw money.** All amounts flow through a `Money` value object — never `double`.
4. **One source of truth for auth.** Route gating lives in the go_router `redirect`; token attach/refresh lives in one Dio interceptor. No scattered `if (loggedIn)`.
5. **Design tokens, never hardcoded hex.** Colors/typography come from one token set → light + dark `ThemeData`.
6. **Direction-agnostic UI.** Use `EdgeInsetsDirectional` and `start/end`; Arabic RTL then comes free from the locale.
7. **Mirror the backend.** Each NestJS module maps 1:1 to a Flutter feature with one Retrofit client + one repository.

---

## 2. Stack

| Concern | Package | Notes |
|---|---|---|
| State + DI | `flutter_riverpod`, `riverpod_annotation` (+ `riverpod_generator`, `riverpod_lint`, `custom_lint`) | LOCKED. State management **and** DI. |
| Navigation | `go_router` | Declarative, deep links, auth redirect guard. |
| HTTP | `dio` | Interceptors: auth, error, logging. |
| Typed API | `retrofit` (+ `retrofit_generator`) | Clients from annotated abstract classes. |
| Models | `freezed`, `json_serializable` (+ annotations) | Immutable models, sealed unions, JSON. |
| Result type | small sealed `Result<T>` (freezed) | Typed success/failure out of repositories. |
| Secure storage | `flutter_secure_storage` | Access + refresh tokens. |
| Prefs | `shared_preferences` | Locale, **themeMode**, flags. |
| Local cache | — | **Online-only for v1** (decision). No drift/hive. |
| L10n | `flutter_localizations` + `intl` + `gen-l10n` (ARB) | EN/AR; RTL automatic. |
| Images | `cached_network_image` | R2-hosted product images. |
| Codegen | `build_runner` | Drives freezed/json/riverpod/retrofit. |
| Testing | `mocktail`, `flutter_test`, `integration_test` | Unit, widget, integration. |

### Representative `pubspec.yaml` (dependencies)
```yaml
dependencies:
  flutter_riverpod: ^2.6.0
  riverpod_annotation: ^2.6.0
  go_router: ^14.0.0
  dio: ^5.7.0
  retrofit: ^4.4.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0
  flutter_secure_storage: ^9.2.0
  shared_preferences: ^2.3.0
  intl: ^0.19.0
  cached_network_image: ^3.4.0
  flutter_localizations:
    sdk: flutter

dev_dependencies:
  build_runner: ^2.4.0
  riverpod_generator: ^2.6.0
  riverpod_lint: ^2.6.0
  custom_lint: ^0.7.0
  retrofit_generator: ^9.1.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
  mocktail: ^1.0.0
```
> Pin to the latest stable on `flutter create` day; versions above are indicative.

---

## 3. Complete folder & file structure (feature-first)

> Fully expanded for **app/**, **core/**, and the **auth** + **catalog** features; the
> other features (`cart`, `checkout`, `orders`, `account`, `assistant`) follow the
> identical `data / domain / presentation` shape shown for catalog.

```
rozhna_app/
├── pubspec.yaml
├── analysis_options.yaml            # lints + riverpod_lint / custom_lint
├── build.yaml                       # build_runner config
├── l10n.yaml                        # gen-l10n config
├── README.md
├── android/  ios/                   # from `flutter create`; flavor configs live here
│
├── lib/
│   ├── main_dev.dart                # bootstrap(Env.dev)
│   ├── main_prod.dart               # bootstrap(Env.prod)
│   ├── bootstrap.dart               # runZonedGuarded → ProviderScope → runApp(App())
│   │
│   ├── app/
│   │   ├── app.dart                 # MaterialApp.router; theme + darkTheme + themeMode + locale
│   │   ├── router/
│   │   │   ├── app_router.dart       # GoRouter provider + redirect guard
│   │   │   ├── routes.dart           # path/name constants
│   │   │   └── auth_notifier.dart    # Listenable that ticks on login/logout
│   │   ├── theme/
│   │   │   ├── app_colors.dart       # berry/gold/coral/cream tokens — LIGHT + DARK sets
│   │   │   ├── app_typography.dart   # Bodoni Moda + Plus Jakarta Sans text theme
│   │   │   ├── app_spacing.dart      # 4px-scale spacing constants
│   │   │   ├── app_radii.dart        # radii: cards 16, pill, fields
│   │   │   ├── app_theme.dart        # lightTheme + darkTheme (Material 3) from tokens
│   │   │   └── theme_controller.dart # @riverpod themeMode (persisted in prefs)
│   │   └── env/
│   │       └── env.dart              # Env enum + AppConfig (apiBaseUrl, flags) + provider
│   │
│   ├── core/
│   │   ├── network/
│   │   │   ├── dio_client.dart
│   │   │   ├── auth_interceptor.dart    # attach token; refresh-on-401 w/ rotation + single-flight
│   │   │   ├── error_interceptor.dart
│   │   │   ├── logging_interceptor.dart
│   │   │   └── api_result.dart          # sealed Result<T> = Success | Failure
│   │   ├── storage/
│   │   │   ├── token_store.dart         # secure storage: access + refresh
│   │   │   └── prefs.dart               # shared_preferences (locale, themeMode)
│   │   ├── money/
│   │   │   └── money.dart               # whole-dinar IQD value object + format
│   │   ├── error/
│   │   │   ├── failure.dart             # sealed Failure types
│   │   │   └── error_mapper.dart        # DioException/status → Failure
│   │   ├── extensions/                  # context/num/string/date extensions
│   │   ├── constants/                   # api paths, durations, asset keys
│   │   └── widgets/
│   │       ├── app_scaffold.dart
│   │       ├── rozhna_app_bar.dart      # shared top app bar (wordmark + back/cart)
│   │       ├── bottom_nav.dart          # Home/Shop/Search/Profile
│   │       ├── primary_button.dart      # berry pill CTA
│   │       ├── app_text_field.dart      # rounded field + berry focus + eye toggle
│   │       ├── phone_field.dart         # +964 prefix + flag
│   │       ├── async_value_view.dart    # loading/error/retry/data
│   │       └── skeletons/
│   │
│   ├── l10n/
│   │   ├── app_en.arb
│   │   └── app_ar.arb
│   │
│   └── features/
│       ├── auth/
│       │   ├── data/
│       │   │   ├── auth_api.dart                 # @RestApi: login, register, sendOtp, verifyOtp, refresh, reset
│       │   │   ├── auth_repository_impl.dart
│       │   │   └── dtos/
│       │   │       ├── login_request.dart
│       │   │       ├── register_request.dart
│       │   │       ├── otp_request.dart
│       │   │       └── auth_response.dart        # tokens + user
│       │   ├── domain/
│       │   │   ├── auth_repository.dart          # abstract
│       │   │   └── entities/
│       │   │       ├── app_user.dart
│       │   │       └── auth_session.dart
│       │   └── presentation/
│       │       ├── providers/
│       │       │   ├── auth_controller.dart      # @riverpod session: login/logout/restore
│       │       │   └── is_logged_in.dart
│       │       ├── login/
│       │       │   ├── login_screen.dart
│       │       │   └── login_form_controller.dart
│       │       ├── signup/
│       │       │   ├── signup_screen.dart
│       │       │   └── signup_form_controller.dart
│       │       ├── otp/
│       │       │   ├── otp_screen.dart
│       │       │   └── otp_controller.dart        # countdown, resend, verify
│       │       └── forgot_password/
│       │           ├── forgot_password_screen.dart
│       │           └── reset_password_screen.dart
│       │
│       ├── catalog/
│       │   ├── data/
│       │   │   ├── catalog_api.dart               # products, categories, search
│       │   │   ├── catalog_repository_impl.dart
│       │   │   └── dtos/                           # product/category/page DTOs
│       │   ├── domain/
│       │   │   ├── catalog_repository.dart
│       │   │   └── entities/                       # product, variant, category, review
│       │   └── presentation/
│       │       ├── home/        # home_screen.dart, home_controller.dart
│       │       ├── shop/        # shop_screen.dart, filters_controller.dart
│       │       ├── product/     # product_screen.dart, product_controller.dart, variant_sheet.dart
│       │       ├── search/      # search_screen.dart, search_controller.dart
│       │       └── widgets/     # product_card.dart, category_chip.dart
│       │
│       ├── cart/
│       │   ├── data/            # cart_api.dart, cart_repository_impl.dart, dtos/
│       │   ├── domain/          # cart_repository.dart, entities/ (cart, cart_item), use_cases/cart_totals.dart
│       │   └── presentation/    # cart_screen.dart, cart_controller.dart, coupon_controller.dart
│       │
│       ├── checkout/
│       │   ├── data/            # checkout_api.dart, repo, dtos/
│       │   ├── domain/          # checkout_repository.dart, entities/
│       │   └── presentation/
│       │       ├── address/       # address_step_screen.dart, address_controller.dart
│       │       ├── payment/       # payment_step_screen.dart, payment_controller.dart
│       │       ├── review/        # review_step_screen.dart, place_order_controller.dart
│       │       └── confirmation/  # order_success_screen.dart
│       │
│       ├── orders/
│       │   ├── data/  ·  domain/
│       │   └── presentation/   # orders_screen.dart, order_detail_screen.dart, tracking_screen.dart
│       │
│       ├── account/
│       │   ├── data/  ·  domain/
│       │   └── presentation/
│       │       ├── profile/     # profile_screen.dart
│       │       ├── addresses/   # addresses_screen.dart, edit_address_screen.dart
│       │       └── wishlist/    # wishlist_screen.dart
│       │
│       └── assistant/           # AI chat — dormant until backend enables it
│           ├── data/  ·  domain/
│           └── presentation/    # assistant_chat_screen.dart, chat_controller.dart
│
├── test/
│   ├── core/                    # money_test.dart, error_mapper_test.dart
│   └── features/
│       ├── auth/                # auth_repository_test.dart, otp_controller_test.dart
│       └── cart/                # cart_totals_test.dart
└── integration_test/
    └── checkout_flow_test.dart  # login → browse → add to cart → checkout → placed
```

Generated files (`*.freezed.dart`, `*.g.dart`) sit beside their source and are git-ignored or committed per team preference.

---

## 4. Layer responsibilities & the dependency rule

```
presentation  →  domain  →  data
 (widgets +      (entities,   (Retrofit API,
  Notifiers)      repo iface)   repo impl, DTOs)
```

- **presentation** — widgets + Riverpod `Notifier`s. No business logic beyond view state. Talks only to providers.
- **domain** — plain Dart: entities + abstract repository interfaces (+ use-cases only where real rules exist, e.g. cart totals, coupon validation). No Dio/JSON.
- **data** — Retrofit clients, DTOs (JSON), repository impls that map DTO → entity and wrap calls in `Result<T>`.

UI → Notifier → Repository(abstract) → RepositoryImpl → Retrofit API. The UI never imports Dio.

---

## 5. State management conventions (Riverpod)

> **Scaffold note (2026-06-21):** the project currently uses **manual Riverpod providers** (`NotifierProvider`, `Provider`), not `@riverpod` codegen — the `riverpod_generator` 3.x toolchain conflicts with `flutter_riverpod 3.3.2` right now. freezed/json/retrofit codegen is still planned per-feature. Switch Riverpod to codegen once the generator versions align.

- Code-gen (`@riverpod`) for providers and notifiers (target; see note above).
- Async screens use `AsyncValue` + a shared `AsyncValueView` for loading/error/retry/data.
- `.family` for parameterized providers (`productProvider(id)`).
- DI: Dio, repos, stores are plain providers, overridden per flavor/test.

```dart
@riverpod
CartRepository cartRepository(CartRepositoryRef ref) =>
    CartRepositoryImpl(ref.watch(dioProvider));

@riverpod
class CartController extends _$CartController {
  @override
  Future<Cart> build() => ref.watch(cartRepositoryProvider).fetch().unwrapOrThrow();

  Future<void> add(CartItem item) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(cartRepositoryProvider).add(item).unwrapOrThrow(),
    );
  }
}

// UI
final cart = ref.watch(cartControllerProvider);
return AsyncValueView(cart, data: (c) => CartView(c));
```

---

## 6. Networking, auth & token refresh

- **`AuthInterceptor`** attaches `Authorization: Bearer <access>` from `TokenStore`.
- **Refresh-on-401 with rotation**: on a 401, call refresh **once** (single-flight; queue concurrent requests). The backend **rotates on use** — returns a NEW access **and** NEW refresh token and invalidates the old refresh. On success, **persist the new pair** and retry the original request. On failure, clear tokens → router redirects to login.
- **Mobile token model**: access + refresh in `flutter_secure_storage`. (The web dashboard uses an httpOnly refresh cookie; mobile stores tokens directly.)

```dart
abstract class TokenStore {
  Future<String?> get accessToken;
  Future<String?> get refreshToken;
  Future<void> save({required String access, required String refresh});
  Future<void> clear();
}
```

### Auth model (LOCKED)
- **Login = phone (+964) + password.**
- **WhatsApp is verification-only**: at sign-up an OTP is sent over WhatsApp to confirm the number (also for password reset). Not a login method.
- **No guest checkout** — cart/checkout routes are gated.

🔧 **Backend work required:** the current API is email/password JWT only. These endpoints must be **added** server-side: phone+password login, register, WhatsApp OTP send/verify, password reset, and **refresh-token rotation + reuse-detection**. The app is built against the intended contract; align DTOs when the endpoints land.

---

## 6a. Local storage — what's stored where (and what isn't)

Two stores only (online-only v1, no local DB):

| Store | Package | Encrypted? | Holds |
|---|---|---|---|
| Secure | `flutter_secure_storage` (Keychain / Keystore) | ✅ Yes | **access token, refresh token** |
| Prefs | `shared_preferences` | ❌ No (plaintext) | locale, themeMode, "onboarding seen" flag |

- **No cookies.** Mobile auth is **bearer tokens in the `Authorization` header**, not cookies. The web dashboard's httpOnly refresh cookie does NOT apply here — nothing cookie-based is stored, and **no cookie jar** (`dio_cookie_manager`) is used.
- **Tokens live in secure storage only** — never `shared_preferences` (plaintext).
- **No persisted user object / cart.** On launch: read refresh token → restore session (refresh / `GET /me`) → hold `AppUser` in Riverpod memory. Cart is server-side, fetched each session. Logout clears secure storage.

---

## 7. Navigation & route guarding (go_router)

```dart
GoRouter(
  refreshListenable: authNotifier,         // ticks on login/logout
  redirect: (context, state) {
    final loggedIn = ref.read(isLoggedInProvider);
    final goingToAuth = state.matchedLocation.startsWith('/auth');
    if (!loggedIn && !goingToAuth) return '/auth/login';
    if (loggedIn && goingToAuth)   return '/home';
    return null;
  },
  routes: [...],
);
```

This single redirect enforces "no guest checkout" app-wide.

---

## 8. Money & IQD

```dart
class Money {
  final int amount;            // WHOLE DINARS (IQD, 0 decimals)
  final String currency;       // 'IQD'
  const Money(this.amount, {this.currency = 'IQD'});
  String format(Locale locale); // NumberFormat → "26,200 IQD", no fraction
}
```

✅ **RESOLVED:** the stored integer is **whole dinars** (IQD has 0 decimals). No ×1000 fils conversion. Formatting uses thousands separators and no fractional part. All money conversion/formatting is isolated in `Money` — widgets never touch raw ints.

---

## 9. Localization & RTL

- ARB files `app_en.arb` / `app_ar.arb` → generated `AppLocalizations`.
- `MaterialApp.router` gets `supportedLocales: [en, ar]` + delegates.
- RTL automatic from locale. Keep layouts directional (`EdgeInsetsDirectional`, `start/end`). Stitch mockups are LTR; Flutter mirrors them.
- Decide EN vs AR-Indic numerals per locale (intl handles it).

---

## 10. Theming (light + dark from day one)

- `app_colors.dart` / `app_typography.dart` / `app_spacing.dart` / `app_radii.dart` encode the Radiant Retail DNA once: berry/rose `#ba0048`–`#e31b5d`, champagne gold `#c5a059`, coral `#f97066`, cream surfaces; Bodoni Moda (display/headline) + Plus Jakarta Sans (body/label).
- `app_theme.dart` builds **both `lightTheme` and `darkTheme`** (Material 3) from those tokens — included from the start (decision).
- `theme_controller.dart` exposes a `themeMode` provider persisted in prefs (system / light / dark).
- Components never hardcode hex — they read `Theme.of(context)` / `AppColors`.

---

## 11. Flavors / environments

- `main_dev.dart` / `main_prod.dart` call `bootstrap(Env.dev|prod)`.
- Per-flavor config (`apiBaseUrl`, feature flags) via Riverpod override + `--dart-define`.
- **dev** → Neon/Render dev API. **prod** → parked until go-prod (no R2/ANTHROPIC keys yet).
- The **AI assistant** screen stays dormant client-side until the backend reports it enabled.

---

## 11a. Platforms & build environment

Both **Android and iOS** from one Dart codebase (zero platform-specific Dart).

- **Android:** `minSdk = 23` (set — required by flutter_secure_storage); `compileSdk`/`targetSdk` = Flutter defaults.
- **iOS:** deployment target **13.0** (satisfies flutter_secure_storage ≥12 and other plugins).
- ⚠️ **iOS can only be compiled/run on macOS** (Xcode + CocoaPods). A Windows dev machine builds/runs **Android only**. For iOS use a Mac or a macOS CI runner (Codemagic / GitHub Actions `macos-latest` / Bitrise). The code is iOS-ready; the build host is the constraint.
- iOS device builds, push, and the App Store require an **Apple Developer account** ($99/yr).

## 11b. Push notifications (planned)

Cross-platform push via **Firebase Cloud Messaging**.

- **Packages:** `firebase_core`, `firebase_messaging`, `flutter_local_notifications` (display foreground messages).
- **Android:** `google-services.json`; Android **13+ needs the runtime `POST_NOTIFICATIONS` permission**.
- **iOS:** `GoogleService-Info.plist` + an **APNs auth key** (Apple Dev account); enable *Push Notifications* and *Background Modes → Remote notifications* capabilities (configured on macOS).
- **App structure:** a `core/notifications/` messaging service — request permission, register the device token with the API, handle foreground/background/tap routing — feeding the existing **`account/notifications`** in-app center.
- **Backend:** the NestJS **notifications** module must store device tokens and send via the FCM API. **Push** (FCM, device-delivered) is distinct from **in-app** (the existing notification list).
- Not installed yet — needs a Firebase project + config files (+ Apple Dev account for iOS).

## 12. Backend mapping (NestJS module → Flutter feature)

| NestJS module | Flutter feature | Notes |
|---|---|---|
| auth | `auth` | phone+password, WhatsApp OTP verify (pending backend) |
| catalog / products / categories | `catalog` | home, shop, product, search, variants |
| cart | `cart` | line items, coupon apply |
| orders / fulfilment | `orders` | list, detail, tracking |
| addresses | `account/addresses` | governorate/city enums |
| payments | `checkout` | methods, place order |
| discounts/coupons | `cart`/`checkout` | apply + validate |
| reviews | `catalog` (product) | list + write |
| notifications | `account` + `core/notifications` | in-app center + **FCM push** (device tokens, send via FCM) |
| assistant (chat) | `assistant` | dormant until `ANTHROPIC_API_KEY` |

---

## 13. Testing strategy

> **Deferred** — not part of the v1 build (decision 2026-06-21). Strategy kept here for when we add it later.

- **Unit**: domain use-cases + repo impls (mock Dio with `mocktail`); `Money` formatting; cart/coupon logic.
- **Widget**: key screens with `ProviderScope(overrides: …)` injecting fake repos.
- **Integration**: login → browse → add to cart → checkout → order placed.

---

## 14. Codegen

```bash
dart run build_runner watch --delete-conflicting-outputs
```
Drives freezed, json_serializable, riverpod_generator, retrofit_generator.

---

## 15. Decisions (resolved 2026-06-21)

1. ✅ **IQD storage unit** — **whole dinars** (0 decimals). `Money.amount` == whole dinars.
2. 🔧 **Backend auth endpoints** — to be **added** server-side: phone+password login, register, WhatsApp OTP send/verify, password reset. App built against the intended contract.
3. ✅ **Refresh-token rotation** — **yes, rotate on use**: each refresh returns a new access + new refresh; old refresh invalidated (reuse-detection). Interceptor persists the new pair (single-flight). Backend must implement.
4. ✅ **Offline** — **online-only** for v1. No drift/hive.
5. ✅ **Theme** — **light + dark from the start**, both from the same tokens; `themeMode` persisted.

---

## 16. Conventions cheat-sheet
- Files: `snake_case.dart`. Classes: `PascalCase`. Providers: `camelCase` + `Provider` (gen).
- One public widget per file; private sub-widgets below it.
- Repositories return `Result<T>`; Notifiers convert to `AsyncValue`.
- No `BuildContext` in domain/data. No Dio/JSON in domain/presentation.
- Directional padding everywhere. Tokens for all colors/text/spacing/radii.
