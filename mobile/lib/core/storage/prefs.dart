import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Non-secret preferences: locale, themeMode, onboarding flag.
/// Overridden in [bootstrap] with the loaded SharedPreferences instance.
final prefsProvider = Provider<AppPrefs>(
  (ref) => throw UnimplementedError('prefsProvider must be overridden in bootstrap'),
);

class AppPrefs {
  AppPrefs(this._p);
  final SharedPreferences _p;

  static const _kThemeMode = 'theme_mode';
  static const _kLocale = 'locale';
  static const _kOnboarded = 'onboarded';

  ThemeMode get themeMode => switch (_p.getString(_kThemeMode)) {
        'light' => ThemeMode.light,
        'dark' => ThemeMode.dark,
        _ => ThemeMode.system,
      };
  Future<void> setThemeMode(ThemeMode m) => _p.setString(_kThemeMode, m.name);

  String? get localeCode => _p.getString(_kLocale);
  Future<void> setLocale(String code) => _p.setString(_kLocale, code);

  bool get onboarded => _p.getBool(_kOnboarded) ?? false;
  Future<void> setOnboarded(bool v) => _p.setBool(_kOnboarded, v);
}
