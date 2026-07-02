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

  /// Deterministic height of the text block under a product card's square image
  /// (boutique brand line + 2-line name + one-line price + card padding). Grid
  /// cells and sliders are sized to `columnWidth + this`, so the square image
  /// fills the rest with no dead space and sale/non-sale cards match exactly.
  static const double productCardTextHeight = 108;

  /// Horizontal product slider item sizing: square image (item width) + the
  /// text block, so slider cards match the grid with no extra slack.
  static const double productSliderItemWidth = 160;
  static const double productSliderHeight =
      productSliderItemWidth + productCardTextHeight;

  /// Blog/story card sizing in a BLOG section slider.
  static const double blogCardWidth = 260;
  static const double blogSliderHeight = 230;

  /// Material 3 NavigationBar height — content scrolling behind the frosted nav
  /// (extendBody) pads its bottom by this + the safe-area inset.
  static const double bottomNavHeight = 80;
}
