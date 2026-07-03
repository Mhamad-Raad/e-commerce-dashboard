import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/crash/crash_reporter.dart';
import '../features/auth/presentation/providers/auth_controller.dart';
import '../l10n/app_localizations.dart';
import 'locale/ckb_localizations.dart';
import 'locale/locale_controller.dart';
import 'router/app_router.dart';
import 'theme/app_theme.dart';
import 'theme/theme_controller.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Tag crash reports with the signed-in customer (cleared on logout).
    ref.listen(authControllerProvider,
        (_, next) => CrashReporter.setUser(next.customer?.id));
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeControllerProvider);
    final locale = ref.watch(localeControllerProvider);

    return MaterialApp.router(
      title: "Rozhna's Store",
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,
      routerConfig: router,
      // English / Arabic / Kurdish Sorani (ckb) — Arabic + ckb flip to RTL.
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      // ckb fallbacks (Arabic built-ins) must precede the Global delegates.
      localizationsDelegates: const [
        AppLocalizations.delegate,
        ...ckbFallbackDelegates,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
