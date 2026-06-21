import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final homeApiProvider = Provider<HomeApi>((ref) => HomeApi(ref.watch(dioProvider)));

/// Transport for the server-driven home layout (ordered sections).
class HomeApi {
  HomeApi(this._dio);
  final Dio _dio;

  Future<List<dynamic>> getLayout() async {
    final res = await _dio.get('/home/layout');
    return res.data is List ? res.data as List : const [];
  }
}
