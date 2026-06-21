import 'home_section_item.dart';

/// A home section's design kind. Matches the backend HomeSectionType.
/// `unknown` makes the app forward-compatible if the backend adds a new type.
enum HomeSectionType { banner, blog, brands, categories, products, unknown }

HomeSectionType _typeFromString(String? raw) => switch (raw) {
      'BANNER' => HomeSectionType.banner,
      'BLOG' => HomeSectionType.blog,
      'BRANDS' => HomeSectionType.brands,
      'CATEGORIES' => HomeSectionType.categories,
      'PRODUCTS' => HomeSectionType.products,
      _ => HomeSectionType.unknown,
    };

/// One server-configured home section (ordered list of these = the home page).
class HomeSection {
  const HomeSection({
    required this.id,
    required this.type,
    required this.items,
    this.title,
    this.config = const {},
  });

  final String id;
  final HomeSectionType type;
  // Already resolved to the requested language by the backend (?lang).
  final String? title;
  final Map<String, dynamic> config;
  final List<HomeSectionItem> items;

  /// e.g. config['layout'] == 'grid' for a PRODUCTS grid (default: slider).
  String get layout {
    final value = config['layout'];
    return value is String ? value : 'slider';
  }

  factory HomeSection.fromJson(Map<String, dynamic> json) => HomeSection(
        id: json['id'] as String,
        type: _typeFromString(json['type'] as String?),
        title: (json['title'] as String?)?.isEmpty ?? true
            ? null
            : json['title'] as String?,
        config: json['config'] is Map
            ? Map<String, dynamic>.from(json['config'] as Map)
            : const {},
        items: json['items'] is List
            ? (json['items'] as List)
                .whereType<Map>()
                .map((e) => HomeSectionItem.fromJson(Map<String, dynamic>.from(e)))
                .toList()
            : const [],
      );
}
