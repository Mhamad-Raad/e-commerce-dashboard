import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../app/theme/app_radii.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/intl_locale.dart';
import '../../../../core/l10n/l10n_ext.dart';

/// One review: stars, optional title/comment, reviewer + date footer.
/// [pending] adds the "pending approval" chip (the customer's own review).
class ReviewCard extends StatelessWidget {
  const ReviewCard({
    super.key,
    required this.rating,
    required this.createdAt,
    this.title,
    this.comment,
    this.reviewerName,
    this.pending = false,
  });

  final int rating;
  final DateTime createdAt;
  final String? title;
  final String? comment;
  final String? reviewerName;
  final bool pending;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;
    final color = scheme.tertiary;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: AppRadii.cardRadius,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              for (var i = 1; i <= 5; i++)
                Icon(
                  i <= rating ? Icons.star_rounded : Icons.star_border_rounded,
                  size: 16,
                  color: i <= rating ? color : scheme.outline,
                ),
              const Spacer(),
              if (pending) _PendingChip(),
            ],
          ),
          if (title != null && title!.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(title!,
                style: text.titleSmall, overflow: TextOverflow.ellipsis),
          ],
          if (comment != null && comment!.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(comment!, style: text.bodyMedium),
          ],
          const SizedBox(height: AppSpacing.sm),
          Text(
            [
              if (reviewerName != null && reviewerName!.isNotEmpty)
                reviewerName!,
              DateFormat.yMMMd(intlLocale(locale)).format(createdAt),
            ].join(' · '),
            style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}

class _PendingChip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AppSpacing.sm, vertical: 2),
      decoration: BoxDecoration(
        color: scheme.secondaryContainer,
        borderRadius: AppRadii.pill,
      ),
      child: Text(
        context.l10n.reviewPendingApproval,
        style: Theme.of(context)
            .textTheme
            .labelSmall
            ?.copyWith(color: scheme.onSecondaryContainer),
      ),
    );
  }
}
