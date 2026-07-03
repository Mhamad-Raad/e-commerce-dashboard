import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/error/failure.dart';
import '../../../core/network/api_result.dart';
import '../domain/product_review.dart';
import 'reviews_api.dart';

final reviewsRepositoryProvider = Provider<ReviewsRepository>(
    (ref) => ReviewsRepository(ref.watch(reviewsApiProvider)));

class ReviewsRepository {
  ReviewsRepository(this._api);
  final ReviewsApi _api;

  Future<Result<ReviewsPage>> list(String productId,
      {required int take, required int skip}) async {
    try {
      return Success(ReviewsPage.fromJson(
          await _api.list(productId, take: take, skip: skip)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<MyReview?>> mine(String productId) async {
    try {
      final raw = await _api.mine(productId);
      return Success(raw == null ? null : MyReview.fromJson(raw));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<MyReview?>> upsertMine(
    String productId, {
    required int rating,
    String? title,
    String? comment,
  }) async {
    try {
      final raw = await _api.upsertMine(productId,
          rating: rating, title: title, comment: comment);
      return Success(raw == null ? null : MyReview.fromJson(raw));
    } on DioException catch (e) {
      // 403 here = review gate (no delivered order with this product), not auth.
      if (e.response?.statusCode == 403) {
        return const Failed(ReviewNotAllowedFailure());
      }
      return Failed(mapError(e));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<void>> deleteMine(String productId) async {
    try {
      await _api.deleteMine(productId);
      return const Success(null);
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}
