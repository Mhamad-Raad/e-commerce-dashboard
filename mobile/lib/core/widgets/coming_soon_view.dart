import 'package:flutter/material.dart';

import '../../app/theme/app_spacing.dart';
import '../l10n/l10n_ext.dart';

/// Placeholder body for tabs/screens not built yet.
class ComingSoonView extends StatelessWidget {
  const ComingSoonView({super.key, this.icon = Icons.construction_outlined});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: AppSpacing.xl, color: scheme.onSurfaceVariant),
          const SizedBox(height: AppSpacing.md),
          Text(context.l10n.comingSoon, style: Theme.of(context).textTheme.bodyLarge),
        ],
      ),
    );
  }
}
