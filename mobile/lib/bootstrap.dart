import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'app/env/env.dart';
import 'core/crash/crash_reporter.dart';
import 'core/push/push_messaging.dart';
import 'core/storage/prefs.dart';
import 'core/version_gate/version_gate_controller.dart';

/// Shared startup for both flavors. Loads prefs, wires DI overrides, runs the app,
/// and captures uncaught framework + zone errors.
Future<void> bootstrap(AppConfig config) async {
  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      // Crashlytics no-ops until Firebase initialises below (checked per call),
      // so wiring the handler first loses nothing.
      FlutterError.onError = (details) {
        FlutterError.presentError(details);
        CrashReporter.recordFlutterError(details);
      };

      // Load locale date symbols so DateFormat works for ar (ckb maps to ar).
      await initializeDateFormatting();

      // Initialise Firebase for push. No-op (push stays dormant) until the
      // native Firebase config is added — see PushService / FcmService.
      await initFirebaseMessaging();
      await CrashReporter.init();

      final sharedPrefs = await SharedPreferences.getInstance();
      final packageInfo = await PackageInfo.fromPlatform();

      runApp(
        ProviderScope(
          overrides: [
            appConfigProvider.overrideWithValue(config),
            prefsProvider.overrideWithValue(AppPrefs(sharedPrefs)),
            currentAppVersionProvider.overrideWithValue(packageInfo.version),
          ],
          child: const App(),
        ),
      );
    },
    (error, stack) {
      debugPrint('Uncaught zone error: $error\n$stack');
      CrashReporter.recordError(error, stack);
    },
  );
}
