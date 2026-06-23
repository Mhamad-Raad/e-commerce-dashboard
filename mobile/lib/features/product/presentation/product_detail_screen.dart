import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_sizes.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/app_typography.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../../cart/presentation/providers/cart_controller.dart';
import '../../cart/presentation/widgets/cart_button.dart';
import '../../favorites/presentation/widgets/favorite_button.dart';
import '../data/product_repository.dart';
import '../domain/product_detail.dart';

/// Storefront product detail: gallery, brand/name, rating, price, description, a
/// variant selector, quantity, a favorite toggle, and add-to-cart.
class ProductDetailScreen extends ConsumerWidget {
  const ProductDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final detailAsync = ref.watch(productDetailProvider(id));

    return Scaffold(
      appBar: AppBar(
        actions: [
          FavoriteButton(productId: id),
          const CartButton(),
        ],
      ),
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.productLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(productDetailProvider(id)),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (detail) => _ProductBody(detail: detail),
      ),
    );
  }
}

class _ProductBody extends ConsumerStatefulWidget {
  const _ProductBody({required this.detail});

  final ProductDetail detail;

  @override
  ConsumerState<_ProductBody> createState() => _ProductBodyState();
}

class _ProductBodyState extends ConsumerState<_ProductBody> {
  String? _selectedVariantId;
  int _qty = 1;
  bool _adding = false;

  ProductDetail get _detail => widget.detail;

  ProductVariantOption? get _selectedVariant {
    if (!_detail.hasVariants) return null;
    return _detail.variants.firstWhere(
      (v) => v.id == _selectedVariantId,
      orElse: () => _detail.variants.first,
    );
  }

  int get _availableStock => _selectedVariant?.stock ?? _detail.stock;
  bool get _inStock => _availableStock > 0;

  Future<void> _addToCart() async {
    setState(() => _adding = true);
    final result = await ref.read(cartControllerProvider.notifier).addProduct(
          _detail.id,
          variantId: _selectedVariant?.id,
          quantity: _qty,
        );
    if (!mounted) return;
    setState(() => _adding = false);
    switch (result) {
      case Success():
        showMessage(context, context.l10n.addedToCart);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;
    final variant = _selectedVariant;
    final onSale = variant?.onSale ?? _detail.onSale;
    final price = variant?.price ?? _detail.price;
    final salePrice = variant?.salePrice ?? _detail.salePrice;
    // Clamp the chosen quantity to the selected option's stock.
    final qty = _availableStock > 0 ? _qty.clamp(1, _availableStock) : 1;

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              _Gallery(images: _detail.gallery),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.margin),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_detail.storeName != null)
                      Text(_detail.storeName!,
                          style: AppTypography.brand(scheme.primary)),
                    const SizedBox(height: AppSpacing.xs),
                    Text(_detail.name, style: text.headlineSmall),
                    if (_detail.ratingCount > 0) ...[
                      const SizedBox(height: AppSpacing.sm),
                      _RatingRow(
                        avg: _detail.ratingAvg,
                        count: _detail.ratingCount,
                      ),
                    ],
                    const SizedBox(height: AppSpacing.md),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          salePrice.format(locale: locale),
                          style: text.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: onSale ? scheme.error : scheme.primary,
                          ),
                        ),
                        if (onSale) ...[
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            price.format(locale: locale),
                            style: text.bodyMedium?.copyWith(
                              color: scheme.onSurfaceVariant,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                        const Spacer(),
                        if (!_inStock)
                          Text(l10n.outOfStock,
                              style: text.labelLarge
                                  ?.copyWith(color: scheme.error)),
                      ],
                    ),
                    if (_detail.hasVariants) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text(l10n.options, style: text.titleSmall),
                      const SizedBox(height: AppSpacing.sm),
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: [
                          for (final v in _detail.variants)
                            ChoiceChip(
                              label: Text(v.name),
                              selected: (variant?.id) == v.id,
                              onSelected: v.inStock
                                  ? (_) => setState(() {
                                        _selectedVariantId = v.id;
                                        _qty = 1;
                                      })
                                  : null,
                            ),
                        ],
                      ),
                    ],
                    if (_detail.description != null &&
                        _detail.description!.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text(l10n.productDescription, style: text.titleSmall),
                      const SizedBox(height: AppSpacing.sm),
                      Text(_detail.description!, style: text.bodyMedium),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        _BottomBar(
          quantity: qty,
          maxStock: _availableStock,
          enabled: _inStock && !_adding,
          adding: _adding,
          onDecrement: () => setState(() => _qty = (qty - 1).clamp(1, 9999)),
          onIncrement: _availableStock > qty
              ? () => setState(() => _qty = qty + 1)
              : null,
          onAddToCart: _addToCart,
        ),
      ],
    );
  }
}

class _Gallery extends StatefulWidget {
  const _Gallery({required this.images});

  final List<String> images;

  @override
  State<_Gallery> createState() => _GalleryState();
}

class _GalleryState extends State<_Gallery> {
  final _controller = PageController();
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final images = widget.images.isEmpty ? <String?>[null] : widget.images;
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      height: 320,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _page = i),
            itemCount: images.length,
            itemBuilder: (_, i) =>
                AppNetworkImage(url: images[i], fit: BoxFit.cover),
          ),
          if (images.length > 1)
            Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (var i = 0; i < images.length; i++)
                    Container(
                      width: 7,
                      height: 7,
                      margin:
                          const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: i == _page
                            ? scheme.primary
                            : scheme.surface.withValues(alpha: 0.7),
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _RatingRow extends StatelessWidget {
  const _RatingRow({required this.avg, required this.count});

  final double avg;
  final int count;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(Icons.star_rounded, size: 18, color: scheme.tertiary),
        const SizedBox(width: AppSpacing.xs),
        Text(avg.toStringAsFixed(1), style: text.bodyMedium),
        const SizedBox(width: AppSpacing.xs),
        Text(context.l10n.reviewsCount(count),
            style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
      ],
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.quantity,
    required this.maxStock,
    required this.enabled,
    required this.adding,
    required this.onDecrement,
    required this.onIncrement,
    required this.onAddToCart,
  });

  final int quantity;
  final int maxStock;
  final bool enabled;
  final bool adding;
  final VoidCallback onDecrement;
  final VoidCallback? onIncrement;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.margin,
        AppSpacing.sm,
        AppSpacing.margin,
        AppSpacing.sm + MediaQuery.viewPaddingOf(context).bottom,
      ),
      decoration: BoxDecoration(
        color: scheme.surface,
        boxShadow: [
          BoxShadow(
            color: scheme.shadow.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: scheme.outlineVariant),
              borderRadius: AppRadii.pill,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: quantity > 1 ? onDecrement : null,
                  icon: const Icon(Icons.remove),
                  visualDensity: VisualDensity.compact,
                ),
                Text('$quantity',
                    style: Theme.of(context).textTheme.titleMedium),
                IconButton(
                  onPressed: onIncrement,
                  icon: const Icon(Icons.add),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: FilledButton.icon(
              onPressed: enabled ? onAddToCart : null,
              icon: adding
                  ? SizedBox(
                      width: AppSizes.buttonSpinner,
                      height: AppSizes.buttonSpinner,
                      child: CircularProgressIndicator(
                        strokeWidth: AppSizes.buttonSpinnerStroke,
                        color: scheme.onPrimary,
                      ),
                    )
                  : const Icon(Icons.add_shopping_cart_outlined),
              label: Text(l10n.addToCart),
            ),
          ),
        ],
      ),
    );
  }
}
