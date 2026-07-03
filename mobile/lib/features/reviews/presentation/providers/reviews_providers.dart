import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../../../product/data/product_repository.dart';
import '../../data/reviews_repository.dart';
import '../../domain/product_review.dart';

/// How many reviews the product-detail section previews.
const reviewsPreviewCount = 3;

/// First few reviews + aggregate for the product-detail Reviews section.
final reviewsPreviewProvider =
    FutureProvider.autoDispose.family<ReviewsPage, String>((ref, productId) async {
  final result = await ref
      .watch(reviewsRepositoryProvider)
      .list(productId, take: reviewsPreviewCount, skip: 0);
  return result.unwrapOrThrow();
});

/// The signed-in customer's own review (null = none yet, or logged out).
final myReviewProvider =
    FutureProvider.autoDispose.family<MyReview?, String>((ref, productId) async {
  final loggedIn = ref.watch(
      authControllerProvider.select((s) => s.status == AuthStatus.authenticated));
  if (!loggedIn) return null;
  final result = await ref.watch(reviewsRepositoryProvider).mine(productId);
  return result.unwrapOrThrow();
});

/// Paginated list state for the full reviews screen.
class ProductReviewsState {
  const ProductReviewsState({
    this.items = const [],
    this.status = ReviewsStatus.loading,
    this.loadingMore = false,
    this.total = 0,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.failure,
  });

  final List<ProductReview> items;
  final ReviewsStatus status;
  final bool loadingMore;
  final int total;
  final double ratingAvg;
  final int ratingCount;
  final Failure? failure;

  bool get hasMore => items.length < total;

  ProductReviewsState copyWith({
    List<ProductReview>? items,
    ReviewsStatus? status,
    bool? loadingMore,
    int? total,
    double? ratingAvg,
    int? ratingCount,
    Failure? failure,
  }) =>
      ProductReviewsState(
        items: items ?? this.items,
        status: status ?? this.status,
        loadingMore: loadingMore ?? this.loadingMore,
        total: total ?? this.total,
        ratingAvg: ratingAvg ?? this.ratingAvg,
        ratingCount: ratingCount ?? this.ratingCount,
        failure: failure,
      );
}

enum ReviewsStatus { loading, data, error }

/// One product's paginated reviews (the "see all" screen).
final productReviewsControllerProvider = NotifierProvider.family
    .autoDispose<ProductReviewsController, ProductReviewsState, String>(
        ProductReviewsController.new);

class ProductReviewsController extends Notifier<ProductReviewsState> {
  ProductReviewsController(this.productId);

  final String productId;
  static const _pageSize = 10;

  ReviewsRepository get _repo => ref.read(reviewsRepositoryProvider);

  @override
  ProductReviewsState build() {
    Future.microtask(_loadFirst);
    return const ProductReviewsState();
  }

  Future<void> _loadFirst() async {
    state = state.copyWith(status: ReviewsStatus.loading);
    final result = await _repo.list(productId, take: _pageSize, skip: 0);
    switch (result) {
      case Success(value: final page):
        state = state.copyWith(
          items: page.items,
          total: page.total,
          ratingAvg: page.ratingAvg,
          ratingCount: page.ratingCount,
          status: ReviewsStatus.data,
        );
      case Failed(failure: final f):
        state = state.copyWith(status: ReviewsStatus.error, failure: f);
    }
  }

  Future<void> loadMore() async {
    if (state.loadingMore || !state.hasMore) return;
    state = state.copyWith(loadingMore: true);
    final result =
        await _repo.list(productId, take: _pageSize, skip: state.items.length);
    switch (result) {
      case Success(value: final page):
        state = state.copyWith(
          items: [...state.items, ...page.items],
          total: page.total,
          ratingAvg: page.ratingAvg,
          ratingCount: page.ratingCount,
          loadingMore: false,
        );
      case Failed():
        // Keep what we have; allow another attempt.
        state = state.copyWith(loadingMore: false);
    }
  }

  Future<void> refresh() => _loadFirst();
}

/// Refresh every review surface for a product after a write (upsert/delete):
/// section preview, full list, own review, and the detail's aggregate rating.
void invalidateProductReviews(WidgetRef ref, String productId) {
  ref.invalidate(reviewsPreviewProvider(productId));
  ref.invalidate(productReviewsControllerProvider(productId));
  ref.invalidate(myReviewProvider(productId));
  ref.invalidate(productDetailProvider(productId));
}
