import 'package:flutter/widgets.dart';

import '../../l10n/app_localizations.dart';

/// `context.l10n.logIn` — shorthand for the generated localizations.
extension L10nX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}
