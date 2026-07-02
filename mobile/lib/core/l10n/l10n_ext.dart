import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

import '../../l10n/app_localizations.dart';

/// `context.l10n.logIn` — shorthand for the generated localizations.
extension L10nX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);

  /// Locale-aware digits for counts interpolated into l10n strings ("12" →
  /// "١٢" in ar/ckb, matching Money's digit style). Kept out of the generated
  /// code because NumberFormat has no `ckb` data — we map ckb → ar like Money.
  String localizedNumber(int value) {
    final code = Localizations.localeOf(this).languageCode;
    return NumberFormat.decimalPattern(code == 'ckb' ? 'ar' : code)
        .format(value);
  }
}
