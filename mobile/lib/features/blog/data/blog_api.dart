import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final blogApiProvider = Provider<BlogApi>((ref) => BlogApi(ref.watch(dioProvider)));

class BlogApi {
  BlogApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> getPost(String id, String lang) async {
    final res = await _dio.get('/blog/$id', queryParameters: {'lang': lang});
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }

  /// Published posts, newest first (`GET /blog?lang=` — no pagination).
  Future<List<Map<String, dynamic>>> getList(String lang) async {
    final res = await _dio.get('/blog', queryParameters: {'lang': lang});
    final raw = res.data is List ? res.data as List : const [];
    return raw
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }
}
