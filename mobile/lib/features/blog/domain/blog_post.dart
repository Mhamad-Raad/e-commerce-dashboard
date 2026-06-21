/// A full blog/story article (GET /api/blog/:id?lang=). Text is already resolved
/// to the requested language by the backend.
class BlogPost {
  const BlogPost({
    required this.id,
    required this.title,
    this.body,
    this.coverImage,
    this.publishedAt,
  });

  final String id;
  final String title;
  final String? body;
  final String? coverImage;
  final DateTime? publishedAt;

  factory BlogPost.fromJson(Map<String, dynamic> json) => BlogPost(
        id: json['id'] as String,
        title: (json['title'] as String?) ?? '',
        body: json['body'] as String?,
        coverImage: json['coverImage'] as String?,
        publishedAt: json['publishedAt'] == null
            ? null
            : DateTime.tryParse(json['publishedAt'].toString()),
      );
}
