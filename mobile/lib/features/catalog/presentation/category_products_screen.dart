import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../data/catalog_repository.dart';
import 'widgets/product_grid.dart';

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

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: pageAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.homeLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(categoryProductsProvider(id)),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (page) => page.items.isEmpty
            ? Center(child: Text(l10n.noResults))
            : ProductGrid(products: page.items),
      ),
    );
  }
}
