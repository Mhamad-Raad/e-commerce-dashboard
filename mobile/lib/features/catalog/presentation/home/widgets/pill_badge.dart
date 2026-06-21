import 'package:flutter/material.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_spacing.dart';

/// Small uppercase pill badge ("NEW ARRIVALS", "BESTSELLER"). Defaults to the
/// berry primary; pass [background]/[foreground] for variants (e.g. gold).
class PillBadge extends StatelessWidget {
  const PillBadge({super.key, required this.label, this.background, this.foreground});

  final String label;
  final Color? background;
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs / 2,
      ),
      decoration: BoxDecoration(
        color: background ?? scheme.primary,
        borderRadius: AppRadii.pill,
      ),
      child: Text(
        label.toUpperCase(),
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: foreground ?? scheme.onPrimary,
            ),
      ),
    );
  }
}
