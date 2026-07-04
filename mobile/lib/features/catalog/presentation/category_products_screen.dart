import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/status_views.dart';
import '../data/catalog_repository.dart';
import 'widgets/product_grid.dart';
import 'widgets/product_grid_skeleton.dart';

/// Products within a single category, reached by tapping a CATEGORY home item.
/// The category name is passed via `extra` for the app-bar title (falls back to
/// the generic "Products" label).
class CategoryProductsScreen extends ConsumerWidget {
  const CategoryProductsScreen({super.key, required this.id, this.name});

  final String id;
  final String? name;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final pageAsync = ref.watch(categoryProductsProvider(id));
    final title = (name != null && name!.isNotEmpty) ? name! : l10n.tabProducts;

    Future<void> refresh() => ref.refresh(categoryProductsProvider(id).future);

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: pageAsync.when(
        loading: () => const ProductGridSkeleton(),
        error: (_, _) => ErrorRetry(
          message: l10n.homeLoadError,
          onRetry: () => ref.invalidate(categoryProductsProvider(id)),
        ),
        data: (page) => page.items.isEmpty
            ? RefreshableFill(
                onRefresh: refresh,
                child:
                    EmptyState(icon: Icons.search_off, title: l10n.noResults),
              )
            : RefreshIndicator(
                onRefresh: refresh,
                child: ProductGrid(products: page.items),
              ),
      ),
    );
  }
}
