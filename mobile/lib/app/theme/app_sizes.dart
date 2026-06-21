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
}
