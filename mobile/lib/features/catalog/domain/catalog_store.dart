/// A seller store as shown on the storefront.
class CatalogStore {
  const CatalogStore({
    required this.id,
    required this.name,
    this.logoUrl,
    this.description,
    this.productCount = 0,
  });

  final String id;
  final String name;
  final String? logoUrl;
  final String? description;
  final int productCount;

  factory CatalogStore.fromJson(Map<String, dynamic> json) => CatalogStore(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? '',
        logoUrl: json['logoUrl'] as String?,
        description: json['description'] as String?,
        // Flat `productCount` (/home/layout) or nested `_count.products` (/homepage).
        productCount: (json['productCount'] as int?) ?? _count(json['_count']),
      );

  static int _count(dynamic count) =>
      count is Map && count['products'] is int ? count['products'] as int : 0;
}
