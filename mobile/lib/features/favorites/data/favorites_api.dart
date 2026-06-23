import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final favoritesApiProvider =
    Provider<FavoritesApi>((ref) => FavoritesApi(ref.watch(dioProvider)));

/// Transport for the customer's favorites (`/app/favorites`, customer-JWT
/// scoped). Add/remove are idempotent server-side.
class FavoritesApi {
  FavoritesApi(this._dio);
  final Dio _dio;

  Future<List<dynamic>> getAll(String lang) async {
    final res = await _dio.get('/app/favorites', queryParameters: {'lang': lang});
    return res.data is List ? res.data as List : const [];
  }

  Future<void> add(String productId) => _dio.post('/app/favorites/$productId');

  Future<void> remove(String productId) =>
      _dio.delete('/app/favorites/$productId');
}
