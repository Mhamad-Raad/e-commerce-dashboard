import 'package:flutter/material.dart';

import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/app_network_image.dart';

/// Circular image + label, used by the Brands and Categories sections.
class CircleTile extends StatelessWidget {
  const CircleTile({
    super.key,
    required this.imageUrl,
    required this.label,
    this.onTap,
  });

  final String? imageUrl;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSizes.categoryAvatar),
      child: SizedBox(
        width: AppSizes.categoryAvatar + AppSpacing.md,
        child: Column(
          children: [
            ClipOval(
              child: AppNetworkImage(
                url: imageUrl,
                width: AppSizes.categoryAvatar,
                height: AppSizes.categoryAvatar,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
