import '../../../core/money/money.dart';

/// A selectable variant (e.g. a shade/size). Variant names aren't translated in
/// the catalog, so [name] is shown as-is.
class ProductVariantOption {
  const ProductVariantOption({
    required this.id,
    required this.name,
    required this.priceCents,
    required this.stock,
    this.salePriceCents,
    this.imageUrl,
    this.currency = 'IQD',
  });

  final String id;
  final String name;
  final int priceCents;
  final int stock;
  final int? salePriceCents;
  final String? imageUrl;
  final String currency;

  bool get inStock => stock > 0;
  bool get onSale => salePriceCents != null && salePriceCents! < priceCents;
  Money get price => Money(priceCents, currency: currency);
  Money get salePrice => Money(salePriceCents ?? priceCents, currency: currency);

  factory ProductVariantOption.fromJson(Map<String, dynamic> json,
          {String currency = 'IQD'}) =>
      ProductVariantOption(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? '',
        priceCents: (json['priceCents'] as num?)?.toInt() ?? 0,
        salePriceCents: (json['salePriceCents'] as num?)?.toInt(),
        stock: (json['stock'] as num?)?.toInt() ?? 0,
        imageUrl: json['imageUrl'] as String?,
        currency: currency,
      );
}

/// Full product detail for the storefront (`GET /app/products/:id`). Name and
/// description are already resolved to the requested language.
class ProductDetail {
  const ProductDetail({
    required this.id,
    required this.name,
    required this.priceCents,
    required this.stock,
    required this.isFavorite,
    this.description,
    this.salePriceCents,
    this.currency = 'IQD',
    this.imageUrl,
    this.images = const [],
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.storeName,
    this.categoryName,
    this.variants = const [],
  });

  final String id;
  final String name;
  final int priceCents;
  final int stock;
  final bool isFavorite;
  final String? description;
  final int? salePriceCents;
  final String currency;
  final String? imageUrl;
  final List<String> images;
  final double ratingAvg;
  final int ratingCount;
  final String? storeName;
  final String? categoryName;
  final List<ProductVariantOption> variants;

  bool get inStock => stock > 0;
  bool get hasVariants => variants.isNotEmpty;
  bool get onSale => salePriceCents != null && salePriceCents! < priceCents;
  Money get price => Money(priceCents, currency: currency);
  Money get salePrice => Money(salePriceCents ?? priceCents, currency: currency);

  /// Cover first, then gallery images.
  List<String> get gallery =>
      [if (imageUrl != null && imageUrl!.isNotEmpty) imageUrl!, ...images];

  factory ProductDetail.fromJson(Map<String, dynamic> json) {
    final currency = (json['currency'] as String?) ?? 'IQD';
    final rawVariants = json['variants'];
    return ProductDetail(
      id: json['id'] as String,
      name: (json['name'] as String?) ?? '',
      description: json['description'] as String?,
      priceCents: (json['priceCents'] as num?)?.toInt() ?? 0,
      salePriceCents: (json['salePriceCents'] as num?)?.toInt(),
      currency: currency,
      imageUrl: json['imageUrl'] as String?,
      images: (json['images'] as List?)?.whereType<String>().toList() ?? const [],
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      ratingAvg: (json['ratingAvg'] as num?)?.toDouble() ?? 0,
      ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      storeName: json['store'] is Map ? json['store']['name'] as String? : null,
      categoryName:
          json['category'] is Map ? json['category']['name'] as String? : null,
      isFavorite: (json['isFavorite'] as bool?) ?? false,
      variants: rawVariants is List
          ? rawVariants
              .whereType<Map>()
              .map((e) => ProductVariantOption.fromJson(
                  Map<String, dynamic>.from(e), currency: currency))
              .toList()
          : const [],
    );
  }
}
