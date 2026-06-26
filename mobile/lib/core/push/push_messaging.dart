import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Whether Firebase initialised successfully on this launch. Push notifications
/// are DORMANT until the native Firebase config is added (google-services.json
/// on Android / GoogleService-Info.plist on iOS): without it
/// `Firebase.initializeApp()` throws and we run with push disabled. Mirrors the
/// backend's "no FIREBASE_* env → FcmService no-ops" posture so the whole app
/// runs end-to-end before any Firebase project exists.
bool firebaseReady = false;

/// Initialise Firebase + register the background message handler. Safe to call
/// unconditionally from bootstrap — it swallows the "not configured" failure.
Future<void> initFirebaseMessaging() async {
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    firebaseReady = true;
  } catch (e) {
    firebaseReady = false;
    debugPrint('Firebase not configured — push notifications disabled. ($e)');
  }
}

/// Background/terminated message handler. Must be a top-level function. The OS
/// renders the `notification` payload itself while the app is backgrounded, so
/// there is nothing to draw here; taps are routed via onMessageOpenedApp /
/// getInitialMessage when the app resumes.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Intentionally minimal — no UI/work needed in the background isolate.
}
