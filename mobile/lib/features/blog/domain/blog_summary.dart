/// Blog post as shown in a BLOG home section (list/card). Text is already
/// resolved to the requested language by the backend (?lang).
class BlogSummary {
  const BlogSummary({
    required this.id,
    required this.title,
    this.excerpt,
    this.coverImage,
  });

  final String id;
  final String title;
  final String? excerpt;
  final String? coverImage;

  factory BlogSummary.fromJson(Map<String, dynamic> json) => BlogSummary(
        id: json['id'] as String,
        title: (json['title'] as String?) ?? '',
        excerpt: json['excerpt'] as String?,
        coverImage: json['coverImage'] as String?,
      );
}
