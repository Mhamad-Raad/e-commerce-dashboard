import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/status_views.dart';
import '../../catalog/presentation/home/widgets/product_card.dart';
import '../../catalog/presentation/widgets/product_grid_skeleton.dart';
import 'providers/favorites_providers.dart';

/// The customer's favorite products, in a grid. Pushed over the tab shell from
/// Profile. Tapping a card opens its detail; the heart on each card removes it.
class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final favoritesAsync = ref.watch(favoritesListProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.myFavorites)),
      body: favoritesAsync.when(
        loading: () => const ProductGridSkeleton(),
        error: (_, _) => ErrorRetry(
          message: l10n.favoritesLoadError,
          onRetry: () => ref.invalidate(favoritesListProvider),
        ),
        data: (products) => products.isEmpty
            ? RefreshableFill(
                onRefresh: () => ref.refresh(favoritesListProvider.future),
                child: _Empty(),
              )
            : RefreshIndicator(
                onRefresh: () => ref.refresh(favoritesListProvider.future),
                child: LayoutBuilder(
                  builder: (context, constraints) => GridView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(AppSpacing.margin),
                    gridDelegate: productGridDelegate(
                      constraints.maxWidth - AppSpacing.margin * 2,
                    ),
                    itemCount: products.length,
                    itemBuilder: (_, i) => ProductCard(
                      product: products[i],
                      onTap: () =>
                          context.push(Routes.productDetail(products[i].id)),
                    ),
                  ),
                ),
              ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.favorite_border,
                size: 48, color: scheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.noFavoritesYet,
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Text(l10n.favoritesHint, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
