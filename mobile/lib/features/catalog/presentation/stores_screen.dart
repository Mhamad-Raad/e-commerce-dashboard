import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/app_network_image.dart';
import '../data/catalog_repository.dart';
import '../domain/catalog_store.dart';

/// The stores/brands showcase. Tapping a store opens its page.
class StoresScreen extends ConsumerWidget {
  const StoresScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final storesAsync = ref.watch(catalogStoresProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.stores)),
      body: storesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.storesLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(catalogStoresProvider),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (stores) => stores.isEmpty
            ? Center(child: Text(l10n.comingSoon))
            : ListView.separated(
                padding: const EdgeInsets.all(AppSpacing.margin),
                itemCount: stores.length,
                separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
                itemBuilder: (_, i) => _StoreTile(store: stores[i]),
              ),
      ),
    );
  }
}

class _StoreTile extends StatelessWidget {
  const _StoreTile({required this.store});

  final CatalogStore store;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    return InkWell(
      borderRadius: AppRadii.cardRadius,
      onTap: () => context.push(Routes.storeDetail(store.id)),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          borderRadius: AppRadii.cardRadius,
          border: Border.all(color: scheme.outlineVariant),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: AppRadii.fieldRadius,
              child: AppNetworkImage(url: store.logoUrl, width: 56, height: 56),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(store.name, style: text.titleSmall),
                  Text(
                      l10n.productsCount(
                          context.localizedNumber(store.productCount)),
                      style: text.bodySmall
                          ?.copyWith(color: scheme.onSurfaceVariant)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }
}
