import 'catalog_product.dart';

/// A store with its products (`/app/stores/:id`).
class StoreDetail {
  const StoreDetail({
    required this.id,
    required this.name,
    required this.products,
    this.description,
    this.logoUrl,
    this.productCount = 0,
  });

  final String id;
  final String name;
  final List<CatalogProduct> products;
  final String? description;
  final String? logoUrl;
  final int productCount;

  factory StoreDetail.fromJson(Map<String, dynamic> json) {
    final rawProducts = json['products'];
    return StoreDetail(
      id: json['id'] as String,
      name: (json['name'] as String?) ?? '',
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      productCount: (json['productCount'] as num?)?.toInt() ?? 0,
      products: rawProducts is List
          ? rawProducts
              .whereType<Map>()
              .map((e) => CatalogProduct.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}

/// One page of product search results (`/app/products`).
class ProductPage {
  const ProductPage({
    required this.items,
    required this.hasMore,
    required this.total,
  });

  final List<CatalogProduct> items;
  final bool hasMore;
  final int total;

  factory ProductPage.fromJson(Map<String, dynamic> json) {
    final raw = json['items'];
    return ProductPage(
      items: raw is List
          ? raw
              .whereType<Map>()
              .map((e) => CatalogProduct.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
      hasMore: (json['hasMore'] as bool?) ?? false,
      total: (json['total'] as num?)?.toInt() ?? 0,
    );
  }
}
