import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/locale/locale_controller.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../data/catalog_repository.dart';
import '../../domain/catalog_product.dart';
import '../../domain/product_query.dart';

/// Paginated, filterable product list state for the PLP.
class ProductBrowseState {
  const ProductBrowseState({
    this.query = const ProductQuery(),
    this.items = const [],
    this.status = BrowseStatus.loading,
    this.hasMore = false,
    this.loadingMore = false,
    this.total = 0,
    this.failure,
  });

  final ProductQuery query;
  final List<CatalogProduct> items;
  final BrowseStatus status;
  final bool hasMore;
  final bool loadingMore;
  final int total;
  final Failure? failure;

  ProductBrowseState copyWith({
    ProductQuery? query,
    List<CatalogProduct>? items,
    BrowseStatus? status,
    bool? hasMore,
    bool? loadingMore,
    int? total,
    Failure? failure,
  }) =>
      ProductBrowseState(
        query: query ?? this.query,
        items: items ?? this.items,
        status: status ?? this.status,
        hasMore: hasMore ?? this.hasMore,
        loadingMore: loadingMore ?? this.loadingMore,
        total: total ?? this.total,
        failure: failure,
      );
}

enum BrowseStatus { loading, data, error }

/// The global product listing page (search + filters + pagination).
final productBrowseControllerProvider =
    NotifierProvider<ProductBrowseController, ProductBrowseState>(
        ProductBrowseController.new);

class ProductBrowseController extends Notifier<ProductBrowseState> {
  static const _pageSize = 20;
  int _page = 1;

  CatalogRepository get _repo => ref.read(catalogRepositoryProvider);
  String get _lang => ref.read(localeControllerProvider).languageCode;

  @override
  ProductBrowseState build() {
    // Reload when the language changes.
    ref.watch(localeControllerProvider);
    Future.microtask(_loadFirst);
    return const ProductBrowseState();
  }

  Future<void> _loadFirst() async {
    _page = 1;
    state = state.copyWith(status: BrowseStatus.loading);
    final result =
        await _repo.searchProducts(state.query, _lang, page: _page, pageSize: _pageSize);
    switch (result) {
      case Success(value: final pageData):
        state = state.copyWith(
          items: pageData.items,
          hasMore: pageData.hasMore,
          total: pageData.total,
          status: BrowseStatus.data,
        );
      case Failed(failure: final f):
        state = state.copyWith(status: BrowseStatus.error, failure: f);
    }
  }

  /// Apply new filters/search and reload from page 1.
  Future<void> applyQuery(ProductQuery query) async {
    state = state.copyWith(query: query);
    await _loadFirst();
  }

  void setSearch(String search) => applyQuery(state.query.copyWith(search: search));

  Future<void> loadMore() async {
    if (state.loadingMore || !state.hasMore) return;
    state = state.copyWith(loadingMore: true);
    _page += 1;
    final result =
        await _repo.searchProducts(state.query, _lang, page: _page, pageSize: _pageSize);
    switch (result) {
      case Success(value: final pageData):
        state = state.copyWith(
          items: [...state.items, ...pageData.items],
          hasMore: pageData.hasMore,
          loadingMore: false,
        );
      case Failed():
        // Keep what we have; allow another attempt.
        _page -= 1;
        state = state.copyWith(loadingMore: false);
    }
  }

  Future<void> refresh() => _loadFirst();
}
