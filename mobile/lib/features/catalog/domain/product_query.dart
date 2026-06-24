/// Immutable filter/sort state for the product listing page. Maps to the
/// `/app/products` query parameters.
class ProductQuery {
  const ProductQuery({
    this.search,
    this.categoryId,
    this.storeId,
    this.minPrice,
    this.maxPrice,
    this.inStock = false,
    this.sort = 'newest',
  });

  final String? search;
  final String? categoryId;
  final String? storeId;
  final int? minPrice;
  final int? maxPrice;
  final bool inStock;
  final String sort; // newest | price_asc | price_desc | rating

  /// Active filters beyond the free-text search + default sort (drives the
  /// "filters applied" badge).
  int get activeFilterCount =>
      (categoryId != null ? 1 : 0) +
      (minPrice != null || maxPrice != null ? 1 : 0) +
      (inStock ? 1 : 0) +
      (sort != 'newest' ? 1 : 0);

  ProductQuery copyWith({
    String? search,
    String? categoryId,
    String? storeId,
    int? minPrice,
    int? maxPrice,
    bool? inStock,
    String? sort,
    bool clearCategory = false,
    bool clearPrice = false,
  }) =>
      ProductQuery(
        search: search ?? this.search,
        categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
        storeId: storeId ?? this.storeId,
        minPrice: clearPrice ? null : (minPrice ?? this.minPrice),
        maxPrice: clearPrice ? null : (maxPrice ?? this.maxPrice),
        inStock: inStock ?? this.inStock,
        sort: sort ?? this.sort,
      );

  Map<String, dynamic> toParams(String lang, {required int page, required int pageSize}) => {
        'lang': lang,
        'page': page,
        'pageSize': pageSize,
        'sort': sort,
        if (search != null && search!.trim().isNotEmpty) 'search': search!.trim(),
        if (categoryId != null) 'categoryId': categoryId,
        if (storeId != null) 'storeId': storeId,
        if (minPrice != null) 'minPrice': minPrice,
        if (maxPrice != null) 'maxPrice': maxPrice,
        if (inStock) 'inStock': 'true',
      };
}
