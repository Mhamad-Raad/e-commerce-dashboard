import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/skeleton.dart';
import 'providers/reviews_providers.dart';
import 'widgets/rating_stars.dart';
import 'widgets/review_card.dart';

/// All reviews of one product — paginated, newest first (server order).
class ProductReviewsScreen extends ConsumerStatefulWidget {
  const ProductReviewsScreen({super.key, required this.productId});

  final String productId;

  @override
  ConsumerState<ProductReviewsScreen> createState() =>
      _ProductReviewsScreenState();
}

class _ProductReviewsScreenState extends ConsumerState<ProductReviewsScreen> {
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_maybeLoadMore);
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _maybeLoadMore() {
    if (_scroll.position.extentAfter < 400) {
      ref
          .read(productReviewsControllerProvider(widget.productId).notifier)
          .loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = ref.watch(productReviewsControllerProvider(widget.productId));
    final controller =
        ref.read(productReviewsControllerProvider(widget.productId).notifier);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.reviewsTitle)),
      body: switch (state.status) {
        ReviewsStatus.loading => const _ReviewsSkeleton(),
        ReviewsStatus.error => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(l10n.reviewsLoadError),
                const SizedBox(height: AppSpacing.md),
                FilledButton(
                  onPressed: controller.refresh,
                  child: Text(l10n.retry),
                ),
              ],
            ),
          ),
        ReviewsStatus.data => RefreshIndicator(
            onRefresh: controller.refresh,
            child: ListView(
              controller: _scroll,
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppSpacing.margin),
              children: [
                _Header(
                  avg: state.ratingAvg,
                  count: state.ratingCount,
                ),
                const SizedBox(height: AppSpacing.md),
                if (state.items.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Column(
                      children: [
                        Text(l10n.noReviewsYet,
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: AppSpacing.sm),
                        Text(l10n.reviewsEmptyHint,
                            textAlign: TextAlign.center),
                      ],
                    ),
                  )
                else
                  for (final review in state.items) ...[
                    ReviewCard(
                      rating: review.rating,
                      createdAt: review.createdAt,
                      title: review.title,
                      comment: review.comment,
                      reviewerName: review.customerName,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                if (state.loadingMore)
                  const Padding(
                    padding: EdgeInsets.all(AppSpacing.md),
                    child: Center(child: CircularProgressIndicator()),
                  ),
              ],
            ),
          ),
      },
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.avg, required this.count});

  final double avg;
  final int count;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Row(
      children: [
        Text(avg.toStringAsFixed(1), style: text.displayLarge),
        const SizedBox(width: AppSpacing.md),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            RatingStars(rating: avg),
            const SizedBox(height: AppSpacing.xs),
            Text(
              context.l10n.reviewsCount(context.localizedNumber(count)),
              style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
            ),
          ],
        ),
      ],
    );
  }
}

/// Loading placeholder mirroring the list (header + review cards).
class _ReviewsSkeleton extends StatelessWidget {
  const _ReviewsSkeleton();

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          const SkeletonBox(width: 160, height: 48),
          const SizedBox(height: AppSpacing.lg),
          for (var i = 0; i < 5; i++) ...[
            const SkeletonBox(height: 110),
            const SizedBox(height: AppSpacing.sm),
          ],
        ],
      ),
    );
  }
}
