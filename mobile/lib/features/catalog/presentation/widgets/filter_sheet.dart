import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../data/catalog_repository.dart';
import '../../domain/product_query.dart';

/// Opens the filter/sort bottom sheet, returning the edited query (or null if
/// dismissed without applying).
Future<ProductQuery?> showFilterSheet(BuildContext context, ProductQuery current) {
  return showModalBottomSheet<ProductQuery>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => _FilterSheet(initial: current),
  );
}

const _sorts = ['newest', 'price_asc', 'price_desc', 'rating'];

class _FilterSheet extends ConsumerStatefulWidget {
  const _FilterSheet({required this.initial});

  final ProductQuery initial;

  @override
  ConsumerState<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends ConsumerState<_FilterSheet> {
  late String? _categoryId = widget.initial.categoryId;
  late bool _inStock = widget.initial.inStock;
  late String _sort = widget.initial.sort;
  late final _min = TextEditingController(
      text: widget.initial.minPrice?.toString() ?? '');
  late final _max = TextEditingController(
      text: widget.initial.maxPrice?.toString() ?? '');

  @override
  void dispose() {
    _min.dispose();
    _max.dispose();
    super.dispose();
  }

  String _sortLabel(String s) => switch (s) {
        'price_asc' => context.l10n.sortPriceAsc,
        'price_desc' => context.l10n.sortPriceDesc,
        'rating' => context.l10n.sortRating,
        _ => context.l10n.sortNewest,
      };

  void _apply() {
    Navigator.pop(
      context,
      ProductQuery(
        search: widget.initial.search,
        storeId: widget.initial.storeId,
        categoryId: _categoryId,
        minPrice: int.tryParse(_min.text.trim()),
        maxPrice: int.tryParse(_max.text.trim()),
        inStock: _inStock,
        sort: _sort,
      ),
    );
  }

  void _reset() {
    setState(() {
      _categoryId = null;
      _inStock = false;
      _sort = 'newest';
      _min.clear();
      _max.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final categoriesAsync = ref.watch(catalogCategoriesProvider);

    return Padding(
      padding: EdgeInsets.only(
        left: AppSpacing.margin,
        right: AppSpacing.margin,
        bottom: MediaQuery.viewInsetsOf(context).bottom + AppSpacing.margin,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(l10n.filters, style: text.titleLarge),
                TextButton(onPressed: _reset, child: Text(l10n.reset)),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            Text(l10n.sortBy, style: text.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              children: [
                for (final s in _sorts)
                  ChoiceChip(
                    label: Text(_sortLabel(s)),
                    selected: _sort == s,
                    onSelected: (_) => setState(() => _sort = s),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            Text(l10n.categoriesTitle, style: text.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            categoriesAsync.maybeWhen(
              data: (categories) => Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.xs,
                children: [
                  for (final c in categories)
                    ChoiceChip(
                      label: Text(c.name),
                      selected: _categoryId == c.id,
                      onSelected: (sel) =>
                          setState(() => _categoryId = sel ? c.id : null),
                    ),
                ],
              ),
              orElse: () => const SizedBox.shrink(),
            ),
            const SizedBox(height: AppSpacing.lg),

            Text(l10n.priceRange, style: text.titleSmall),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _min,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(labelText: l10n.minPrice),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: TextField(
                    controller: _max,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(labelText: l10n.maxPrice),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _inStock,
              onChanged: (v) => setState(() => _inStock = v),
              title: Text(l10n.inStockOnly),
            ),
            const SizedBox(height: AppSpacing.md),

            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _apply,
                child: Text(l10n.applyFilters),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
