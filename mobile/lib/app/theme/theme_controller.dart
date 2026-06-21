import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/storage/prefs.dart';

/// Holds the active [ThemeMode], persisted to prefs. Manual Riverpod
/// (codegen deferred until the riverpod_generator 3.x toolchain stabilises).
final themeControllerProvider =
    NotifierProvider<ThemeController, ThemeMode>(ThemeController.new);

class ThemeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ref.read(prefsProvider).themeMode;

  void set(ThemeMode mode) {
    state = mode;
    ref.read(prefsProvider).setThemeMode(mode);
  }

  void toggle(Brightness current) =>
      set(current == Brightness.dark ? ThemeMode.light : ThemeMode.dark);
}
