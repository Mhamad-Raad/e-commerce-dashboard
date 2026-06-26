# Push Notifications (Firebase Cloud Messaging) — activation guide

The push-notification feature is **fully built but dormant**. All the code (mobile
+ backend) ships now; push goes live the moment the Firebase credentials below are
in place — no further code changes. Until then the app runs normally and the
backend simply logs `Firebase is not configured … push notifications are disabled.`

This mirrors the project's R2 / Twilio posture: configure-to-activate.

---

## What's already wired (no action needed)

- **Mobile:** Firebase init (guarded), permission prompt, device-token registration
  on login, unregister on logout, token-refresh handling, foreground display,
  tap → deep-link to the order, an in-app **Notification centre** (`/notifications`,
  bell in the Home/Profile app bar with an unread badge), trilingual EN/AR/CKB.
- **Backend:** `CustomerDevice` + `CustomerNotification` tables, `app/notifications`
  API (list / unread-count / read / read-all / register-device / unregister-device),
  and pushes fired on **order placed** and **order status changed**. Push tray text
  is rendered server-side per device language.

---

## 1. Create the Firebase project
1. <https://console.firebase.google.com> → **Add project** (e.g. "Rozhna").
2. Analytics optional.

## 2. Android app
1. In the project → **Add app → Android**.
2. **Android package name:** `com.rozhna.rozhna_store` (must match exactly).
3. Download **`google-services.json`** → drop it into **`mobile/android/app/google-services.json`**.
4. Apply the Google Services Gradle plugin:
   - `mobile/android/settings.gradle.kts` — in the `plugins { … }` block add:
     ```kotlin
     id("com.google.gms.google-services") version "4.4.2" apply false
     ```
   - `mobile/android/app/build.gradle.kts` — in its top `plugins { … }` block add:
     ```kotlin
     id("com.google.gms.google-services")
     ```
5. `flutter clean && flutter run -t lib/main_dev.dart`. On first launch Android 13+
   shows the notification-permission prompt.

> Until step 3–4 are done the app still builds and runs — push just stays off.

## 3. iOS app (only when building on a Mac)
1. **Add app → iOS**, bundle id from Xcode (`Runner` target).
2. Download **`GoogleService-Info.plist`** → add to `ios/Runner` via Xcode.
3. Apple Developer account → create an **APNs auth key (.p8)**; upload it in
   Firebase → Project settings → **Cloud Messaging → Apple app configuration**.
4. Xcode → Runner target → **Signing & Capabilities** → add **Push Notifications**
   and **Background Modes → Remote notifications**.
   (iOS can only be built on macOS — N/A on the current Windows machine.)

## 4. Backend service-account credentials
1. Firebase → **Project settings → Service accounts → Generate new private key**
   → downloads a JSON file. **Do not commit it / never paste it in chat.**
2. Set three env vars from that JSON (local `backend/.env`, and Render for prod):
   ```
   FIREBASE_PROJECT_ID=<project_id>
   FIREBASE_CLIENT_EMAIL=<client_email>
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
   ```
   The private key is multi-line in the JSON — paste it as **one line with literal
   `\n`** (the backend converts them back). See `backend/.env.example`.
3. Restart the backend. It logs nothing about Firebase being unconfigured = active.

## 5. Test the loop
1. Mobile (dev) logged-in customer → the app registers its FCM token
   (`POST /app/notifications/devices`).
2. In the dashboard, change that customer's order status (or place an order from the
   app). A push arrives; tapping it opens the order; the in-app centre + bell badge
   update too.

---

## What triggers a push
| Event | Type | Deep-link |
|------|------|-----------|
| Customer checks out | `ORDER_PLACED` | order detail |
| Admin changes order status | `ORDER_STATUS_CHANGED` | order detail |

Dead tokens are pruned automatically on send failure; read notifications and
long-silent devices are pruned by a daily job.
