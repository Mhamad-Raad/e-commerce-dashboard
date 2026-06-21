import 'package:flutter/widgets.dart';

/// Corner radii: rounded fields, soft cards, pill buttons/chips.
class AppRadii {
  AppRadii._();

  static const double field = 8;
  static const double card = 16;

  static const BorderRadius fieldRadius = BorderRadius.all(Radius.circular(field));
  static const BorderRadius cardRadius = BorderRadius.all(Radius.circular(card));
  static const BorderRadius pill = BorderRadius.all(Radius.circular(9999));
}
