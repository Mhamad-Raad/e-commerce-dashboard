/// Component sizing tokens (heights, widths, control metrics). Change here once
/// and every screen/theme that references them updates.
class AppSizes {
  AppSizes._();

  /// Primary control height (buttons, ideally matched by fields).
  static const double controlHeight = 52;

  /// Max width for centered form content, so phones fill the width while
  /// tablets/large screens don't stretch the form awkwardly wide.
  static const double maxContentWidth = 480;

  /// Inline button spinner.
  static const double buttonSpinner = 22;
  static const double buttonSpinnerStroke = 2;

  /// Home hero carousel height.
  static const double heroHeight = 180;

  /// Circular category avatar diameter (home categories row).
  static const double categoryAvatar = 64;

  /// Featured products grid: target card width — the grid fits as many columns
  /// as the screen allows, so it scales from phones to tablets.
  static const double productCardMaxWidth = 200;
}
