import 'package:flutter/material.dart';

import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/skeleton.dart';

/// Loading placeholder that mirrors the home layout (hero → categories →
/// products) so the page doesn't "jump" when real content arrives.
class HomeSkeleton extends StatelessWidget {
  const HomeSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        children: [
          // Hero banner
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.margin),
            child: SkeletonBox(height: AppSizes.heroHeight),
          ),
          const SizedBox(height: AppSpacing.lg),
          // Categories row
          SizedBox(
            height: AppSizes.categoryAvatar,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
              itemCount: 5,
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
              itemBuilder: (_, _) => const SkeletonBox(
                width: AppSizes.categoryAvatar,
                height: AppSizes.categoryAvatar,
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          // Section header line
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: AppSpacing.margin),
            child: SkeletonBox(width: 140, height: 20),
          ),
          const SizedBox(height: AppSpacing.md),
          // Product grid (2 rows of 2)
          ...List.generate(2, (_) => const _ProductRow()),
        ],
      ),
    );
  }
}

class _ProductRow extends StatelessWidget {
  const _ProductRow();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.margin,
        0,
        AppSpacing.margin,
        AppSpacing.gutter,
      ),
      child: Row(
        children: [
          Expanded(child: SkeletonBox(height: 220)),
          SizedBox(width: AppSpacing.gutter),
          Expanded(child: SkeletonBox(height: 220)),
        ],
      ),
    );
  }
}
