import 'package:flutter/material.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../app/theme/app_typography.dart';
import '../../../../../core/widgets/app_network_image.dart';
import '../../../domain/catalog_product.dart';
import 'pill_badge.dart';

/// A product tile for the home/shop grids. Cover image (with an optional promo
/// badge), boutique brand in italic serif, name, and price (struck-through
/// original when on sale). Tapping is wired by the parent.
class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, this.badge, this.onTap});

  final CatalogProduct product;
  final String? badge;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    final locale = Localizations.localeOf(context).languageCode;

    return Card(
      clipBehavior: Clip.antiAlias,
      shape: const RoundedRectangleBorder(borderRadius: AppRadii.cardRadius),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  AppNetworkImage(url: product.imageUrl),
                  if (badge != null && badge!.isNotEmpty)
                    Align(
                      alignment: AlignmentDirectional.topStart,
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        child: PillBadge(
                          label: badge!,
                          background: scheme.secondary,
                          foreground: scheme.onSecondary,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (product.storeName != null)
                    Text(
                      product.storeName!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.brand(scheme.primary),
                    ),
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: text.bodyLarge,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  _Price(product: product, locale: locale),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Price extends StatelessWidget {
  const _Price({required this.product, required this.locale});

  final CatalogProduct product;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    if (!product.onSale) {
      return Text(
        product.price.format(locale: locale),
        style: text.bodyLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: scheme.primary,
        ),
      );
    }
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: AppSpacing.xs,
      children: [
        Text(
          product.salePrice.format(locale: locale),
          style: text.bodyLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: scheme.error,
          ),
        ),
        Text(
          product.price.format(locale: locale),
          style: text.bodySmall?.copyWith(
            color: scheme.onSurfaceVariant,
            decoration: TextDecoration.lineThrough,
          ),
        ),
      ],
    );
  }
}
