import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Bodoni Moda for display/headlines, Plus Jakarta Sans for body/labels.
class AppTypography {
  AppTypography._();

  static TextTheme textTheme(ColorScheme scheme) {
    final base = GoogleFonts.plusJakartaSansTextTheme();
    return base
        .copyWith(
          displayLarge: GoogleFonts.bodoniModa(
            fontSize: 36,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
          headlineMedium: GoogleFonts.bodoniModa(
            fontSize: 24,
            fontWeight: FontWeight.w600,
          ),
          titleLarge: GoogleFonts.plusJakartaSans(
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
          bodyLarge: GoogleFonts.plusJakartaSans(fontSize: 16),
          bodySmall: GoogleFonts.plusJakartaSans(fontSize: 14),
          labelMedium: GoogleFonts.plusJakartaSans(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        )
        .apply(bodyColor: scheme.onSurface, displayColor: scheme.onSurface);
  }
}
