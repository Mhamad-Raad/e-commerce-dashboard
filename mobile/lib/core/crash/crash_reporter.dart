import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

import '../push/push_messaging.dart' show firebaseReady;

/// Crash reporting via Firebase Crashlytics. Mirrors push_messaging's dormant
/// posture: every call no-ops while Firebase isn't configured, and collection
/// is off in debug builds so local development never pollutes the console.
class CrashReporter {
  CrashReporter._();

  static bool get _active => firebaseReady && !kDebugMode;

  /// Call once from bootstrap, after Firebase.initializeApp. Syncs the
  /// collection flag both ways so a debug install on a real device stays
  /// silent and a release build reports again after one.
  static Future<void> init() async {
    if (!firebaseReady) return;
    await FirebaseCrashlytics.instance
        .setCrashlyticsCollectionEnabled(!kDebugMode);
  }

  /// Uncaught Flutter framework errors (build/layout/gesture).
  static void recordFlutterError(FlutterErrorDetails details) {
    if (_active) {
      FirebaseCrashlytics.instance.recordFlutterFatalError(details);
    }
  }

  /// Uncaught async/zone errors.
  static void recordError(Object error, StackTrace stack) {
    if (_active) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    }
  }

  /// Tag reports with the signed-in customer; pass null on logout.
  static void setUser(String? customerId) {
    if (_active) {
      FirebaseCrashlytics.instance.setUserIdentifier(customerId ?? '');
    }
  }
}
