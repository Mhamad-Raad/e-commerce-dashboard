import 'dart:math';

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
  static const _kGuestDeviceId = 'guest_device_id';

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

  /// Stable, app-generated id for the unauthenticated assistant trial. Generated
  /// once on first use and persisted, so the backend can hold a guest to their
  /// free-message cap across app restarts (clearing app data resets it — an
  /// accepted limitation; the endpoint is also IP-rate-limited). NOT a hardware
  /// id and never tied to an account.
  String guestDeviceId() {
    final existing = _p.getString(_kGuestDeviceId);
    if (existing != null && existing.isNotEmpty) return existing;
    final id = _randomId();
    _p.setString(_kGuestDeviceId, id); // fire-and-forget persist
    return id;
  }

  // 32 hex chars from a CSPRNG — no uuid package needed.
  static String _randomId() {
    final r = Random.secure();
    return List<int>.generate(16, (_) => r.nextInt(256))
        .map((b) => b.toRadixString(16).padLeft(2, '0'))
        .join();
  }
}
