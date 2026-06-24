import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../cart/presentation/widgets/cart_button.dart';
import 'providers/product_browse_controller.dart';
import 'widgets/filter_sheet.dart';
import 'widgets/product_grid.dart';

/// Products tab — searchable, filterable, paginated catalog grid, plus a way
/// into the Stores showcase.
class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _search = TextEditingController();

  ProductBrowseController get _controller =>
      ref.read(productBrowseControllerProvider.notifier);

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _openFilters() async {
    final state = ref.read(productBrowseControllerProvider);
    final result = await showFilterSheet(context, state.query);
    if (result != null) _controller.applyQuery(result);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = ref.watch(productBrowseControllerProvider);
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: AppSpacing.margin,
        title: SizedBox(
          height: 42,
          child: TextField(
            controller: _search,
            textInputAction: TextInputAction.search,
            onSubmitted: _controller.setSearch,
            decoration: InputDecoration(
              hintText: l10n.searchProducts,
              prefixIcon: const Icon(Icons.search, size: 20),
              isDense: true,
              filled: true,
              fillColor: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
              contentPadding: EdgeInsets.zero,
              border: const OutlineInputBorder(
                borderRadius: AppRadii.pill,
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        actions: [
          IconButton(
            tooltip: l10n.stores,
            onPressed: () => context.push(Routes.stores),
            icon: const Icon(Icons.storefront_outlined),
          ),
          const CartButton(),
        ],
      ),
      body: Column(
        children: [
          _FilterBar(
            count: state.query.activeFilterCount,
            resultCount: state.total,
            onTap: _openFilters,
          ),
          Expanded(child: _results(context, state)),
        ],
      ),
    );
  }

  Widget _results(BuildContext context, ProductBrowseState state) {
    final l10n = context.l10n;
    switch (state.status) {
      case BrowseStatus.loading:
        return const Center(child: CircularProgressIndicator());
      case BrowseStatus.error:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(state.failure?.message ?? l10n.homeLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: _controller.refresh,
                child: Text(l10n.retry),
              ),
            ],
          ),
        );
      case BrowseStatus.data:
        if (state.items.isEmpty) {
          return Center(child: Text(l10n.noResults));
        }
        return ProductGrid(
          products: state.items,
          loadingMore: state.loadingMore,
          onLoadMore: _controller.loadMore,
        );
    }
  }
}

class _FilterBar extends StatelessWidget {
  const _FilterBar({
    required this.count,
    required this.resultCount,
    required this.onTap,
  });

  final int count;
  final int resultCount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          AppSpacing.margin, AppSpacing.xs, AppSpacing.margin, 0),
      child: Row(
        children: [
          Text(l10n.resultsCount(resultCount),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: scheme.onSurfaceVariant,
                  )),
          const Spacer(),
          ActionChip(
            avatar: Icon(Icons.tune,
                size: 18,
                color: count > 0 ? scheme.onPrimary : scheme.onSurface),
            label: Text(
              count > 0 ? '${l10n.filters} ($count)' : l10n.filters,
              style: TextStyle(
                  color: count > 0 ? scheme.onPrimary : scheme.onSurface),
            ),
            backgroundColor: count > 0 ? scheme.primary : null,
            onPressed: onTap,
          ),
        ],
      ),
    );
  }
}
