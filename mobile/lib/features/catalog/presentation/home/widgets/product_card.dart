import 'package:flutter/material.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/app_network_image.dart';
import '../../../domain/catalog_product.dart';

/// A product tile for the home/shop grids. Cover image, name, store, and price
/// (with a struck-through original when on sale). Tapping is wired by the parent.
class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, this.onTap});

  final CatalogProduct product;
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
              child: AppNetworkImage(url: product.imageUrl),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: text.bodyLarge,
                  ),
                  if (product.storeName != null) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      product.storeName!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  ],
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
