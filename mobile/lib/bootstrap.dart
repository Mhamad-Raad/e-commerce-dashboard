import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'app/env/env.dart';
import 'core/push/push_messaging.dart';
import 'core/storage/prefs.dart';

/// Shared startup for both flavors. Loads prefs, wires DI overrides, runs the app,
/// and captures uncaught framework + zone errors.
Future<void> bootstrap(AppConfig config) async {
  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      // TODO: forward to crash reporting (Sentry/Crashlytics) when added.
      FlutterError.onError = (details) {
        FlutterError.presentError(details);
        debugPrint('FlutterError: ${details.exceptionAsString()}');
      };

      // Load locale date symbols so DateFormat works for ar (ckb maps to ar).
      await initializeDateFormatting();

      // Initialise Firebase for push. No-op (push stays dormant) until the
      // native Firebase config is added — see PushService / FcmService.
      await initFirebaseMessaging();

      final sharedPrefs = await SharedPreferences.getInstance();

      runApp(
        ProviderScope(
          overrides: [
            appConfigProvider.overrideWithValue(config),
            prefsProvider.overrideWithValue(AppPrefs(sharedPrefs)),
          ],
          child: const App(),
        ),
      );
    },
    (error, stack) => debugPrint('Uncaught zone error: $error\n$stack'),
  );
}
