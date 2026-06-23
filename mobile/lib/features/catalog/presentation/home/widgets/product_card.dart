import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../app/theme/app_typography.dart';
import '../../../../../core/l10n/l10n_ext.dart';
import '../../../../../core/network/api_result.dart';
import '../../../../../core/widgets/app_network_image.dart';
import '../../../../auth/presentation/widgets/auth_widgets.dart';
import '../../../../cart/presentation/providers/cart_controller.dart';
import '../../../../favorites/presentation/widgets/favorite_button.dart';
import '../../../domain/catalog_product.dart';
import 'pill_badge.dart';

/// A product tile for the home/shop grids. Cover image (with an optional promo
/// badge + quick add-to-cart), boutique brand in italic serif, name, and price
/// (struck-through original when on sale). Tapping is wired by the parent.
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
                  Align(
                    alignment: AlignmentDirectional.topEnd,
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      child: FavoriteButton(productId: product.id, compact: true),
                    ),
                  ),
                  Align(
                    alignment: AlignmentDirectional.bottomEnd,
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      child: _AddToCartButton(product: product),
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

/// Quick "add to cart" affordance overlaid on the product image. Adds one unit;
/// surfaces a snackbar on success or failure (e.g. already-in-cart).
class _AddToCartButton extends ConsumerStatefulWidget {
  const _AddToCartButton({required this.product});

  final CatalogProduct product;

  @override
  ConsumerState<_AddToCartButton> createState() => _AddToCartButtonState();
}

class _AddToCartButtonState extends ConsumerState<_AddToCartButton> {
  bool _busy = false;

  Future<void> _add() async {
    setState(() => _busy = true);
    final result =
        await ref.read(cartControllerProvider.notifier).addProduct(widget.product.id);
    if (!mounted) return;
    setState(() => _busy = false);
    switch (result) {
      case Success():
        showMessage(context, context.l10n.addedToCart);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.primary,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: _busy ? null : _add,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.sm),
          child: _busy
              ? SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: scheme.onPrimary),
                )
              : Icon(Icons.add_shopping_cart_outlined,
                  size: 16, color: scheme.onPrimary),
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
