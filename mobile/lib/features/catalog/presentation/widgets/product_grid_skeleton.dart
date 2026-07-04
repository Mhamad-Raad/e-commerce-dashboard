import 'package:flutter/material.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/widgets/skeleton.dart';
import '../home/widgets/product_card.dart';

/// Shimmer placeholder mirroring [ProductGrid]'s responsive layout, so grids
/// don't "jump" when real products arrive.
class ProductGridSkeleton extends StatelessWidget {
  const ProductGridSkeleton({super.key, this.itemCount = 6});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: LayoutBuilder(
        builder: (context, constraints) => GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.margin),
          gridDelegate: productGridDelegate(
            constraints.maxWidth - AppSpacing.margin * 2,
          ),
          itemCount: itemCount,
          itemBuilder: (_, _) => const SkeletonBox(),
        ),
      ),
    );
  }
}
