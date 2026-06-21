import 'package:flutter/material.dart';

import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/app_network_image.dart';
import '../../../domain/catalog_category.dart';

/// Circular category image + name, used in the home categories row.
class CategoryAvatar extends StatelessWidget {
  const CategoryAvatar({super.key, required this.category, this.onTap});

  final CatalogCategory category;
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
                url: category.imageUrl,
                width: AppSizes.categoryAvatar,
                height: AppSizes.categoryAvatar,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              category.name,
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
