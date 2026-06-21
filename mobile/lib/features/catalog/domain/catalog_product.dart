import '../../../core/money/money.dart';

/// A product as shown in storefront lists/cards. `priceCents` holds whole
/// dinars for IQD (the backend stores 0-decimal money), so it maps 1:1 to Money.
class CatalogProduct {
  const CatalogProduct({
    required this.id,
    required this.name,
    required this.priceCents,
    this.salePriceCents,
    this.currency = 'IQD',
    this.imageUrl,
    this.storeName,
    this.ratingAvg = 0,
    this.ratingCount = 0,
  });

  final String id;
  final String name;
  final int priceCents;
  final int? salePriceCents;
  final String currency;
  final String? imageUrl;
  final String? storeName;
  final double ratingAvg;
  final int ratingCount;

  bool get onSale => salePriceCents != null && salePriceCents! < priceCents;

  Money get price => Money(priceCents, currency: currency);
  Money get salePrice => Money(salePriceCents ?? priceCents, currency: currency);

  factory CatalogProduct.fromJson(Map<String, dynamic> json) => CatalogProduct(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? '',
        priceCents: (json['priceCents'] as num?)?.toInt() ?? 0,
        salePriceCents: (json['salePriceCents'] as num?)?.toInt(),
        currency: (json['currency'] as String?) ?? 'IQD',
        imageUrl: json['imageUrl'] as String?,
        // Accept the flat `storeName` (/home/layout) or nested store (/homepage).
        storeName: (json['storeName'] as String?) ??
            (json['store'] is Map ? json['store']['name'] as String? : null),
        ratingAvg: (json['ratingAvg'] as num?)?.toDouble() ?? 0,
        ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      );
}
