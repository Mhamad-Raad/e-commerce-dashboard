import 'package:flutter/material.dart';

import '../../../../app/theme/app_radii.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';

/// "Arrives in 3–7 days" pill, shown per store group and as the overall cart
/// estimate. Collapses to a single number when min == max.
class ArrivalChip extends StatelessWidget {
  const ArrivalChip({super.key, required this.minDays, required this.maxDays});

  final int minDays;
  final int maxDays;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      decoration: BoxDecoration(
        color: scheme.secondaryContainer.withValues(alpha: 0.45),
        borderRadius: AppRadii.pill,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.schedule, size: 14, color: scheme.onSurfaceVariant),
          const SizedBox(width: AppSpacing.xs),
          Text(
            minDays == maxDays
                ? l10n.arrivalEstimateSingle(context.localizedNumber(minDays))
                : l10n.arrivalEstimate(context.localizedNumber(minDays),
                    context.localizedNumber(maxDays)),
            style: Theme.of(context)
                .textTheme
                .labelSmall
                ?.copyWith(color: scheme.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}
