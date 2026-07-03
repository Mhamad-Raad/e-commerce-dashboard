/// Blog post as shown in a BLOG home section or the blog list. Text is already
/// resolved to the requested language by the backend (?lang).
class BlogSummary {
  const BlogSummary({
    required this.id,
    required this.title,
    this.excerpt,
    this.coverImage,
    this.publishedAt,
  });

  final String id;
  final String title;
  final String? excerpt;
  final String? coverImage;
  final DateTime? publishedAt;

  factory BlogSummary.fromJson(Map<String, dynamic> json) => BlogSummary(
        id: json['id'] as String,
        title: (json['title'] as String?) ?? '',
        excerpt: json['excerpt'] as String?,
        coverImage: json['coverImage'] as String?,
        publishedAt: json['publishedAt'] == null
            ? null
            : DateTime.tryParse(json['publishedAt'].toString()),
      );
}
