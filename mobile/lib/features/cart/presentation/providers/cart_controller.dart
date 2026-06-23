import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../../data/cart_repository.dart';
import '../../domain/cart.dart';
import '../../domain/cart_quote.dart';
import '../../domain/placed_order.dart';

/// The customer's open cart. Mutations return a [Result] (so screens can surface
/// failures) and push the server's returned cart straight into [state] — no
/// separate refetch needed since every cart endpoint returns the updated cart.
final cartControllerProvider =
    AsyncNotifierProvider<CartController, Cart>(CartController.new);

class CartController extends AsyncNotifier<Cart> {
  CartRepository get _repo => ref.read(cartRepositoryProvider);

  @override
  Future<Cart> build() async => (await _repo.getCart()).unwrapOrThrow();

  Future<Result<Cart>> addProduct(String productId,
      {String? variantId, int quantity = 1}) async {
    final result = await _repo.addItem(productId,
        variantId: variantId, quantity: quantity);
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<Cart>> setQuantity(String itemId, int quantity) async {
    final result = await _repo.updateItem(itemId, quantity);
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<Cart>> removeItem(String itemId) async {
    final result = await _repo.removeItem(itemId);
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<Cart>> applyCoupon(String code) async {
    final result = await _repo.applyCoupon(code);
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<Cart>> removeCoupon() async {
    final result = await _repo.removeCoupon();
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<PlacedOrder>> checkout({
    required String addressId,
    required String paymentMethod,
    String? notes,
  }) async {
    final result = await _repo.checkout(
      addressId: addressId,
      paymentMethod: paymentMethod,
      notes: notes,
    );
    if (result is Success<PlacedOrder>) {
      // The cart was consumed (CHECKED_OUT); reload the fresh empty open cart.
      state = await AsyncValue.guard(() async => (await _repo.getCart()).unwrapOrThrow());
    }
    return result;
  }

  void _applyIfSuccess(Result<Cart> result) {
    if (result case Success<Cart>(value: final cart)) {
      state = AsyncData(cart);
    }
  }
}

/// Item count for the app-bar cart badge (0 while loading/empty).
final cartCountProvider = Provider<int>((ref) {
  return ref.watch(cartControllerProvider).maybeWhen(
        data: (cart) => cart.itemCount,
        orElse: () => 0,
      );
});

/// The checkout money breakdown. Re-fetches whenever the cart changes (coupon,
/// quantities) so the review screen always shows the live total.
final cartQuoteProvider = FutureProvider.autoDispose<CartQuote>((ref) async {
  ref.watch(cartControllerProvider);
  final result = await ref.watch(cartRepositoryProvider).getPreview();
  return result.unwrapOrThrow();
});
