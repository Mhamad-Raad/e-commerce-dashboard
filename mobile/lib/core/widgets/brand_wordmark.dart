import 'package:flutter/material.dart';

import '../l10n/l10n_ext.dart';

/// The "Rozhna's Store" display wordmark. Uses colorScheme.primary (not the raw
/// berry token) so it stays readable in dark mode, and pulls the name from l10n.
class BrandWordmark extends StatelessWidget {
  const BrandWordmark({super.key, this.textAlign = TextAlign.center});

  final TextAlign textAlign;

  @override
  Widget build(BuildContext context) {
    return Text(
      context.l10n.brandName,
      textAlign: textAlign,
      style: Theme.of(context).textTheme.displayLarge?.copyWith(
            color: Theme.of(context).colorScheme.primary,
          ),
    );
  }
}
