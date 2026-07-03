import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/dio_client.dart';
import '../domain/order_detail.dart';
import '../domain/order_summary.dart';
import '../domain/reorder_result.dart';

final ordersRepositoryProvider =
    Provider<OrdersRepository>((ref) => OrdersRepository(ref.watch(dioProvider)));

class OrdersRepository {
  OrdersRepository(this._dio);
  final Dio _dio;

  Future<Result<List<OrderSummary>>> list() async {
    try {
      final res = await _dio.get('/app/orders');
      final raw = res.data is List ? res.data as List : const [];
      return Success(raw
          .whereType<Map>()
          .map((e) => OrderSummary.fromJson(Map<String, dynamic>.from(e)))
          .toList());
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<OrderDetail>> detail(String id) async {
    try {
      final res = await _dio.get('/app/orders/$id');
      return Success(
          OrderDetail.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  /// Cancel a PENDING/PROCESSING order. Responds with the fresh order detail
  /// (same shape as [detail]); 409 → ConflictFailure when no longer allowed.
  Future<Result<OrderDetail>> cancel(String id) async {
    try {
      final res = await _dio.post('/app/orders/$id/cancel');
      return Success(
          OrderDetail.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  /// Add an old order's items back into the open cart.
  Future<Result<ReorderResult>> reorder(String id) async {
    try {
      final res = await _dio.post('/app/orders/$id/reorder');
      return Success(
          ReorderResult.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

/// The customer's order history.
final ordersListProvider =
    FutureProvider.autoDispose<List<OrderSummary>>((ref) async {
  final result = await ref.watch(ordersRepositoryProvider).list();
  return result.unwrapOrThrow();
});

/// One order's full detail.
final orderDetailProvider =
    FutureProvider.autoDispose.family<OrderDetail, String>((ref, id) async {
  final result = await ref.watch(ordersRepositoryProvider).detail(id);
  return result.unwrapOrThrow();
});
