/// Blog post as shown in a BLOG home section (list/card). No body.
class BlogSummary {
  const BlogSummary({
    required this.id,
    required this.titleEn,
    this.titleAr,
    this.excerptEn,
    this.excerptAr,
    this.coverImage,
  });

  final String id;
  final String titleEn;
  final String? titleAr;
  final String? excerptEn;
  final String? excerptAr;
  final String? coverImage;

  String title(String lang) =>
      lang == 'ar' ? (titleAr ?? titleEn) : (titleEn);
  String? excerpt(String lang) =>
      lang == 'ar' ? (excerptAr ?? excerptEn) : excerptEn;

  factory BlogSummary.fromJson(Map<String, dynamic> json) => BlogSummary(
        id: json['id'] as String,
        titleEn: (json['titleEn'] as String?) ?? '',
        titleAr: json['titleAr'] as String?,
        excerptEn: json['excerptEn'] as String?,
        excerptAr: json['excerptAr'] as String?,
        coverImage: json['coverImage'] as String?,
      );
}
