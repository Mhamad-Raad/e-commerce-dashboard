import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final homeApiProvider = Provider<HomeApi>((ref) => HomeApi(ref.watch(dioProvider)));

/// Transport for the storefront landing payload.
class HomeApi {
  HomeApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getHomepage() async {
    final res = await _dio.get('/homepage');
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }
}
