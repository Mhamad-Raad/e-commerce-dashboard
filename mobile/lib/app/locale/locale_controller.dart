import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/storage/prefs.dart';

/// The app's selected locale (en / ar / ckb), persisted. English is the default.
final localeControllerProvider =
    NotifierProvider<LocaleController, Locale>(LocaleController.new);

class LocaleController extends Notifier<Locale> {
  @override
  Locale build() => _localeFor(ref.read(prefsProvider).localeCode);

  void set(Locale locale) {
    state = locale;
    ref.read(prefsProvider).setLocale(locale.languageCode);
  }

  static Locale _localeFor(String? code) => switch (code) {
        'ar' => const Locale('ar'),
        'ckb' => const Locale('ckb'),
        _ => const Locale('en'),
      };
}
