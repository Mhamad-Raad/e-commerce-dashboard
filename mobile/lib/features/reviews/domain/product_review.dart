/// One approved review in a product's public list
/// (`GET /app/products/:id/reviews`).
class ProductReview {
  const ProductReview({
    required this.id,
    required this.rating,
    required this.createdAt,
    this.title,
    this.comment,
    this.customerName,
  });

  final String id;
  final int rating;
  final DateTime createdAt;
  final String? title;
  final String? comment;
  final String? customerName;

  factory ProductReview.fromJson(Map<String, dynamic> json) => ProductReview(
        id: json['id'] as String,
        rating: (json['rating'] as num?)?.toInt() ?? 0,
        title: json['title'] as String?,
        comment: json['comment'] as String?,
        customerName: json['customerName'] as String?,
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
            DateTime.fromMillisecondsSinceEpoch(0),
      );
}

/// One page of a product's reviews plus the aggregate rating.
class ReviewsPage {
  const ReviewsPage({
    required this.items,
    required this.total,
    required this.ratingAvg,
    required this.ratingCount,
  });

  final List<ProductReview> items;
  final int total;
  final double ratingAvg;
  final int ratingCount;

  factory ReviewsPage.fromJson(Map<String, dynamic> json) => ReviewsPage(
        items: json['items'] is List
            ? (json['items'] as List)
                .whereType<Map>()
                .map((e) =>
                    ProductReview.fromJson(Map<String, dynamic>.from(e)))
                .toList()
            : const [],
        total: (json['total'] as num?)?.toInt() ?? 0,
        ratingAvg: (json['ratingAvg'] as num?)?.toDouble() ?? 0,
        ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      );
}

/// The signed-in customer's own review of a product
/// (`GET /app/products/:id/reviews/me`; null server-side = no review yet).
class MyReview {
  const MyReview({
    required this.id,
    required this.rating,
    required this.isApproved,
    required this.createdAt,
    this.title,
    this.comment,
  });

  final String id;
  final int rating;
  final bool isApproved;
  final DateTime createdAt;
  final String? title;
  final String? comment;

  factory MyReview.fromJson(Map<String, dynamic> json) => MyReview(
        id: json['id'] as String,
        rating: (json['rating'] as num?)?.toInt() ?? 0,
        title: json['title'] as String?,
        comment: json['comment'] as String?,
        isApproved: (json['isApproved'] as bool?) ?? false,
        createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
            DateTime.fromMillisecondsSinceEpoch(0),
      );
}
