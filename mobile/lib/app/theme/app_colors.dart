import 'package:flutter/material.dart';

/// Radiant Retail design tokens. Berry/rose primary, champagne gold accent,
/// coral CTA, soft cream surfaces. Never reference raw hex outside this file.
class AppColors {
  AppColors._();

  static const berry = Color(0xFFBA0048); // primary
  static const berryBright = Color(0xFFE31B5D); // brand expression / container
  static const gold = Color(0xFFC5A059); // secondary accent
  static const coral = Color(0xFFF97066); // tertiary CTA / sale
  static const cream = Color(0xFFF9F9FF); // surface (light)
  static const ink = Color(0xFF141B2C); // on-surface (light)
  static const errorRed = Color(0xFFBA1A1A);

  static final ColorScheme light = const ColorScheme.light().copyWith(
    primary: berry,
    onPrimary: Colors.white,
    primaryContainer: berryBright,
    onPrimaryContainer: Colors.white,
    secondary: gold,
    onSecondary: Colors.white,
    tertiary: coral,
    onTertiary: Colors.white,
    surface: cream,
    onSurface: ink,
    error: errorRed,
    onError: Colors.white,
  );

  static final ColorScheme dark = const ColorScheme.dark().copyWith(
    primary: const Color(0xFFFFB2BD),
    onPrimary: const Color(0xFF400013),
    primaryContainer: berry,
    onPrimaryContainer: Colors.white,
    secondary: const Color(0xFFE9C176),
    onSecondary: const Color(0xFF261900),
    tertiary: const Color(0xFFFFB4AC),
    onTertiary: const Color(0xFF410003),
    surface: const Color(0xFF141B2C),
    onSurface: const Color(0xFFEDF0FF),
    error: const Color(0xFFFFB4AB),
    onError: const Color(0xFF690005),
  );
}
