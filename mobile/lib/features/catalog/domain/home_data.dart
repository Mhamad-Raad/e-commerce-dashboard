import 'catalog_category.dart';
import 'catalog_product.dart';
import 'catalog_store.dart';
import 'hero_banner.dart';

/// The composed storefront landing payload (GET /api/homepage).
class HomeData {
  const HomeData({
    required this.banners,
    required this.featuredProducts,
    required this.featuredCategories,
    required this.featuredStores,
  });

  final List<HeroBanner> banners;
  final List<CatalogProduct> featuredProducts;
  final List<CatalogCategory> featuredCategories;
  final List<CatalogStore> featuredStores;

  factory HomeData.fromJson(Map<String, dynamic> json) => HomeData(
        banners: _list(json['banners'], HeroBanner.fromJson),
        featuredProducts: _list(json['featuredProducts'], CatalogProduct.fromJson),
        featuredCategories:
            _list(json['featuredCategories'], CatalogCategory.fromJson),
        featuredStores: _list(json['featuredStores'], CatalogStore.fromJson),
      );

  static List<T> _list<T>(dynamic raw, T Function(Map<String, dynamic>) from) =>
      raw is List
          ? raw
              .whereType<Map>()
              .map((e) => from(Map<String, dynamic>.from(e)))
              .toList()
          : <T>[];
}
