import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/cart.dart';
import '../domain/cart_quote.dart';
import '../domain/placed_order.dart';
import 'cart_api.dart';

final cartRepositoryProvider =
    Provider<CartRepository>((ref) => CartRepository(ref.watch(cartApiProvider)));

class CartRepository {
  CartRepository(this._api);
  final CartApi _api;

  Future<Result<Cart>> getCart() => _guardCart(_api.getCart());

  Future<Result<CartQuote>> getPreview() async {
    try {
      return Success(CartQuote.fromJson(await _api.getPreview()));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<Cart>> addItem(String productId,
          {String? variantId, int quantity = 1}) =>
      _guardCart(_api.addItem(productId, variantId: variantId, quantity: quantity));

  Future<Result<Cart>> updateItem(String itemId, int quantity) =>
      _guardCart(_api.updateItem(itemId, quantity));

  Future<Result<Cart>> removeItem(String itemId) =>
      _guardCart(_api.removeItem(itemId));

  Future<Result<Cart>> applyCoupon(String code) =>
      _guardCart(_api.applyCoupon(code));

  Future<Result<Cart>> removeCoupon() => _guardCart(_api.removeCoupon());

  Future<Result<PlacedOrder>> checkout({
    required String addressId,
    required String paymentMethod,
    String? notes,
  }) async {
    try {
      final json = await _api.checkout(
        addressId: addressId,
        paymentMethod: paymentMethod,
        notes: notes,
      );
      return Success(PlacedOrder.fromJson(json));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<Cart>> _guardCart(Future<Map<String, dynamic>> future) async {
    try {
      return Success(Cart.fromJson(await future));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}
