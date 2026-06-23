import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final addressesApiProvider =
    Provider<AddressesApi>((ref) => AddressesApi(ref.watch(dioProvider)));

/// Transport for the customer's own addresses (`/app/addresses`, customer-JWT
/// scoped — the server derives the customer from the token).
class AddressesApi {
  AddressesApi(this._dio);
  final Dio _dio;

  Future<List<dynamic>> getAll() async {
    final res = await _dio.get('/app/addresses');
    return res.data is List ? res.data as List : const [];
  }

  Future<Map<String, dynamic>> create(Map<String, dynamic> body) async {
    final res = await _dio.post('/app/addresses', data: body);
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> update(String id, Map<String, dynamic> body) async {
    final res = await _dio.patch('/app/addresses/$id', data: body);
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<void> delete(String id) => _dio.delete('/app/addresses/$id');
}
