import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_sizes.dart';
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
///
/// Set [showActions] to false to hide the favorite + add-to-cart overlays — both
/// require an account, so guest/preview contexts (e.g. the logged-out assistant
/// trial) render a non-interactive card and handle [onTap] themselves.
class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
    this.badge,
    this.onTap,
    this.showActions = true,
  });

  final CatalogProduct product;
  final String? badge;
  final VoidCallback? onTap;
  final bool showActions;

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
            // Image fills whatever height is left after the fixed text block, so
            // there's never dead space below short cards. Cells are sized (see
            // productGridDelegate / the slider height) so this stays ~square.
            Expanded(
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
                  if (showActions) ...[
                    Align(
                      alignment: AlignmentDirectional.topEnd,
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        child:
                            FavoriteButton(productId: product.id, compact: true),
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
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Reserve the brand line whether or not a store is set, so
                  // every card is the same height.
                  SizedBox(
                    height: 18,
                    child: product.storeName != null
                        ? Text(
                            product.storeName!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.brand(scheme.primary),
                          )
                        : null,
                  ),
                  // Always reserve two lines for the name so one- and two-line
                  // names produce identically sized cards (no uneven gaps).
                  SizedBox(
                    height: 40,
                    child: Text(
                      product.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: text.bodyLarge?.copyWith(height: 1.25),
                    ),
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
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: text.bodyLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: scheme.primary,
        ),
      );
    }
    // A single row (not a Wrap) so a sale card is exactly one line tall like a
    // non-sale one; the struck-through original ellipsizes if space is tight.
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          product.salePrice.format(locale: locale),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: text.bodyLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: scheme.error,
          ),
        ),
        const SizedBox(width: AppSpacing.xs),
        Flexible(
          child: Text(
            product.price.format(locale: locale),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: text.bodySmall?.copyWith(
              color: scheme.onSurfaceVariant,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        ),
      ],
    );
  }
}

/// Grid delegate for product cards: fits as many [AppSizes.productCardMaxWidth]
/// columns as [contentWidth] allows (responsive phone→tablet), then sizes each
/// cell to a square image plus the fixed text block — so there's no dead space
/// under short cards. Pass the grid's inner width (its width minus horizontal
/// padding) from a LayoutBuilder.
SliverGridDelegate productGridDelegate(double contentWidth) {
  const spacing = AppSpacing.gutter;
  const maxExtent = AppSizes.productCardMaxWidth;
  final raw = ((contentWidth + spacing) / (maxExtent + spacing)).ceil();
  final columns = raw < 1 ? 1 : raw;
  final columnWidth = (contentWidth - spacing * (columns - 1)) / columns;
  return SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: columns,
    mainAxisSpacing: spacing,
    crossAxisSpacing: spacing,
    mainAxisExtent: columnWidth + AppSizes.productCardTextHeight,
  );
}
