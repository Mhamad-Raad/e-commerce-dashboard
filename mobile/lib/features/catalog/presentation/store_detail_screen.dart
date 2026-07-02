import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/app_network_image.dart';
import '../data/catalog_repository.dart';
import '../domain/store_detail.dart';
import 'widgets/product_grid.dart';

/// A store/brand page: header (logo, name, description, product count) and its
/// products in a grid.
class StoreDetailScreen extends ConsumerWidget {
  const StoreDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final detailAsync = ref.watch(storeDetailProvider(id));

    return Scaffold(
      appBar: AppBar(
        title: Text(detailAsync.asData?.value.name ?? l10n.stores),
      ),
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.storesLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(storeDetailProvider(id)),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (store) => Column(
          children: [
            _Header(store: store),
            if (store.products.isEmpty)
              Expanded(child: Center(child: Text(l10n.noResults)))
            else
              Expanded(child: ProductGrid(products: store.products)),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.store});

  final StoreDetail store;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.margin),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: AppRadii.cardRadius,
            child: AppNetworkImage(url: store.logoUrl, width: 64, height: 64),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(store.name, style: text.titleLarge),
                Text(
                    l10n.productsCount(
                        context.localizedNumber(store.productCount)),
                    style: text.bodySmall
                        ?.copyWith(color: scheme.onSurfaceVariant)),
                if (store.description != null && store.description!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: AppSpacing.xs),
                    child: Text(store.description!,
                        style: text.bodyMedium, maxLines: 3,
                        overflow: TextOverflow.ellipsis),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
