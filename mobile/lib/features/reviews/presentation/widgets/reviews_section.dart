import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../providers/reviews_providers.dart';
import 'rating_stars.dart';
import 'review_card.dart';
import 'review_editor_sheet.dart';

/// Product-detail Reviews section: aggregate header, the customer's own
/// (pending) review, a short preview list, and the write/see-all actions.
class ReviewsSection extends ConsumerWidget {
  const ReviewsSection({
    super.key,
    required this.productId,
    required this.fallbackAvg,
    required this.fallbackCount,
  });

  final String productId;
  // Aggregate from the already-loaded product detail, shown until the
  // reviews endpoint responds.
  final double fallbackAvg;
  final int fallbackCount;

  void _openEditor(BuildContext context, WidgetRef ref) {
    final loggedIn = ref.read(authControllerProvider).isLoggedIn;
    if (!loggedIn) {
      // Guests: same gate as other auth-only actions — go log in first.
      context.go(Routes.login);
      return;
    }
    final existing = ref.read(myReviewProvider(productId)).asData?.value;
    showReviewEditorSheet(context, productId: productId, existing: existing);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final previewAsync = ref.watch(reviewsPreviewProvider(productId));
    final myReview = ref.watch(myReviewProvider(productId)).asData?.value;

    final page = previewAsync.asData?.value;
    final avg = page?.ratingAvg ?? fallbackAvg;
    final count = page?.ratingCount ?? fallbackCount;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Aggregate header.
        Row(
          children: [
            Expanded(child: Text(l10n.reviewsTitle, style: text.titleSmall)),
            if (count > 0) ...[
              RatingStars(rating: avg, size: 16),
              const SizedBox(width: AppSpacing.xs),
              Text(avg.toStringAsFixed(1), style: text.bodyMedium),
              const SizedBox(width: AppSpacing.xs),
              Text(
                l10n.reviewsCount(context.localizedNumber(count)),
                style:
                    text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
              ),
            ],
          ],
        ),
        const SizedBox(height: AppSpacing.sm),

        // The customer's own not-yet-approved review (approved ones appear in
        // the public list itself).
        if (myReview != null && !myReview.isApproved) ...[
          Text(l10n.yourReview,
              style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
          const SizedBox(height: AppSpacing.xs),
          ReviewCard(
            rating: myReview.rating,
            createdAt: myReview.createdAt,
            title: myReview.title,
            comment: myReview.comment,
            pending: true,
          ),
          const SizedBox(height: AppSpacing.sm),
        ],

        previewAsync.when(
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (_, _) => Row(
            children: [
              Expanded(
                child: Text(l10n.reviewsLoadError, style: text.bodyMedium),
              ),
              TextButton(
                onPressed: () =>
                    ref.invalidate(reviewsPreviewProvider(productId)),
                child: Text(l10n.retry),
              ),
            ],
          ),
          data: (data) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (data.items.isEmpty && !(myReview != null && !myReview.isApproved)) ...[
                Text(l10n.noReviewsYet, style: text.bodyMedium),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  l10n.reviewsEmptyHint,
                  style:
                      text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                ),
              ] else
                for (final review in data.items) ...[
                  ReviewCard(
                    rating: review.rating,
                    createdAt: review.createdAt,
                    title: review.title,
                    comment: review.comment,
                    reviewerName: review.customerName,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                ],
              if (data.total > reviewsPreviewCount)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () =>
                        context.push(Routes.productReviews(productId)),
                    child: Text(l10n.seeAllReviews),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        SizedBox(
          width: double.infinity,
          child: TextButton.icon(
            onPressed: () => _openEditor(context, ref),
            icon: const Icon(Icons.rate_review_outlined),
            label: Text(myReview != null ? l10n.editReview : l10n.writeReview),
          ),
        ),
      ],
    );
  }
}
