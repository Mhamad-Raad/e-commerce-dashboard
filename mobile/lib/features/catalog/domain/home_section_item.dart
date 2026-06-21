import '../../blog/domain/blog_summary.dart';
import 'catalog_category.dart';
import 'catalog_product.dart';
import 'catalog_store.dart';

/// Where tapping a home item goes. Matches the backend HomeTargetType.
enum HomeTargetType { none, product, category, store, blog, url }

HomeTargetType _targetFromString(String? raw) => switch (raw) {
      'PRODUCT' => HomeTargetType.product,
      'CATEGORY' => HomeTargetType.category,
      'STORE' => HomeTargetType.store,
      'BLOG' => HomeTargetType.blog,
      'URL' => HomeTargetType.url,
      _ => HomeTargetType.none,
    };

/// One entry in a home section, with its resolved target object (whichever
/// matches [targetType]).
class HomeSectionItem {
  const HomeSectionItem({
    required this.id,
    required this.targetType,
    this.imageUrl,
    this.label,
    this.url,
    this.product,
    this.category,
    this.store,
    this.blog,
  });

  final String id;
  final HomeTargetType targetType;
  final String? imageUrl;
  final String? label;
  final String? url;
  final CatalogProduct? product;
  final CatalogCategory? category;
  final CatalogStore? store;
  final BlogSummary? blog;

  factory HomeSectionItem.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic>? sub(String key) =>
        json[key] is Map ? Map<String, dynamic>.from(json[key] as Map) : null;
    return HomeSectionItem(
      id: json['id'] as String,
      targetType: _targetFromString(json['targetType'] as String?),
      imageUrl: json['imageUrl'] as String?,
      label: json['label'] as String?,
      url: json['url'] as String?,
      product: sub('product') == null ? null : CatalogProduct.fromJson(sub('product')!),
      category:
          sub('category') == null ? null : CatalogCategory.fromJson(sub('category')!),
      store: sub('store') == null ? null : CatalogStore.fromJson(sub('store')!),
      blog: sub('blogPost') == null ? null : BlogSummary.fromJson(sub('blogPost')!),
    );
  }
}
