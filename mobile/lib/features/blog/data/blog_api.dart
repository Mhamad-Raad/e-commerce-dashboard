import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final blogApiProvider = Provider<BlogApi>((ref) => BlogApi(ref.watch(dioProvider)));

class BlogApi {
  BlogApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getPost(String id) async {
    final res = await _dio.get('/blog/$id');
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }
}
