import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final reviewsApiProvider =
    Provider<ReviewsApi>((ref) => ReviewsApi(ref.watch(dioProvider)));

class ReviewsApi {
  ReviewsApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> list(String productId,
      {required int take, required int skip}) async {
    final res = await _dio.get(
      '/app/products/$productId/reviews',
      queryParameters: {'take': take, 'skip': skip},
    );
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }

  /// The customer's own review — an empty 200 body means "no review yet".
  Future<Map<String, dynamic>?> mine(String productId) async {
    final res = await _dio.get('/app/products/$productId/reviews/me');
    final data = res.data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return null; // empty/blank body
  }

  Future<Map<String, dynamic>?> upsertMine(
    String productId, {
    required int rating,
    String? title,
    String? comment,
  }) async {
    // True PUT semantics: an omitted title/comment clears that field, so the
    // caller always passes the form's current values (null = clear).
    final res = await _dio.put(
      '/app/products/$productId/reviews/me',
      data: {
        'rating': rating,
        'title': ?title,
        'comment': ?comment,
      },
    );
    final data = res.data;
    return data is Map ? Map<String, dynamic>.from(data) : null;
  }

  Future<void> deleteMine(String productId) =>
      _dio.delete('/app/products/$productId/reviews/me');
}
