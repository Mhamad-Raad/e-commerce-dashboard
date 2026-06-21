/// A storefront hero banner (from GET /api/homepage).
class HeroBanner {
  const HeroBanner({
    required this.id,
    required this.title,
    required this.imageUrl,
    this.subtitle,
    this.linkUrl,
  });

  final String id;
  final String title;
  final String imageUrl;
  final String? subtitle;
  final String? linkUrl;

  factory HeroBanner.fromJson(Map<String, dynamic> json) => HeroBanner(
        id: json['id'] as String,
        title: (json['title'] as String?) ?? '',
        imageUrl: (json['imageUrl'] as String?) ?? '',
        subtitle: json['subtitle'] as String?,
        linkUrl: json['linkUrl'] as String?,
      );
}
