/// A full blog/story article (GET /api/blog/:id).
class BlogPost {
  const BlogPost({
    required this.id,
    required this.titleEn,
    this.titleAr,
    this.bodyEn,
    this.bodyAr,
    this.coverImage,
    this.publishedAt,
  });

  final String id;
  final String titleEn;
  final String? titleAr;
  final String? bodyEn;
  final String? bodyAr;
  final String? coverImage;
  final DateTime? publishedAt;

  String title(String lang) => lang == 'ar' ? (titleAr ?? titleEn) : titleEn;
  String? body(String lang) => lang == 'ar' ? (bodyAr ?? bodyEn) : bodyEn;

  factory BlogPost.fromJson(Map<String, dynamic> json) => BlogPost(
        id: json['id'] as String,
        titleEn: (json['titleEn'] as String?) ?? '',
        titleAr: json['titleAr'] as String?,
        bodyEn: json['bodyEn'] as String?,
        bodyAr: json['bodyAr'] as String?,
        coverImage: json['coverImage'] as String?,
        publishedAt: json['publishedAt'] == null
            ? null
            : DateTime.tryParse(json['publishedAt'].toString()),
      );
}
