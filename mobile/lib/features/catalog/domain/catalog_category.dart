/// A product category as shown on the storefront.
class CatalogCategory {
  const CatalogCategory({
    required this.id,
    required this.name,
    this.imageUrl,
    this.productCount = 0,
  });

  final String id;
  final String name;
  final String? imageUrl;
  final int productCount;

  factory CatalogCategory.fromJson(Map<String, dynamic> json) => CatalogCategory(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? '',
        imageUrl: json['imageUrl'] as String?,
        productCount: _count(json['_count']),
      );

  // The backend includes `_count: { products: n }`.
  static int _count(dynamic count) =>
      count is Map && count['products'] is int ? count['products'] as int : 0;
}
