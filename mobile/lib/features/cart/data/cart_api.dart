import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final cartApiProvider =
    Provider<CartApi>((ref) => CartApi(ref.watch(dioProvider)));

/// Transport for the customer's own cart (`/app/cart`, customer-JWT scoped).
class CartApi {
  CartApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getCart() async {
    final res = await _dio.get('/app/cart');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> getPreview() async {
    final res = await _dio.get('/app/cart/preview');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> addItem(String productId,
      {String? variantId, int quantity = 1}) async {
    final res = await _dio.post('/app/cart/items', data: {
      'productId': productId,
      'variantId': ?variantId,
      'quantity': quantity,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> updateItem(String itemId, int quantity) async {
    final res = await _dio
        .patch('/app/cart/items/$itemId', data: {'quantity': quantity});
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> removeItem(String itemId) async {
    final res = await _dio.delete('/app/cart/items/$itemId');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> applyCoupon(String code) async {
    final res = await _dio.post('/app/cart/coupon', data: {'code': code});
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> removeCoupon() async {
    final res = await _dio.delete('/app/cart/coupon');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> checkout({
    required String addressId,
    required String paymentMethod,
    String? notes,
  }) async {
    final res = await _dio.post('/app/cart/checkout', data: {
      'addressId': addressId,
      'paymentMethod': paymentMethod,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }
}
