import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale/locale_controller.dart';
import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/dio_client.dart';
import '../domain/product_detail.dart';

final productRepositoryProvider =
    Provider<ProductRepository>((ref) => ProductRepository(ref.watch(dioProvider)));

class ProductRepository {
  ProductRepository(this._dio);
  final Dio _dio;

  Future<Result<ProductDetail>> detail(String id, String lang) async {
    try {
      final res =
          await _dio.get('/app/products/$id', queryParameters: {'lang': lang});
      return Success(
          ProductDetail.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

/// Product detail by id, resolved to the current language (re-fetches on switch).
final productDetailProvider =
    FutureProvider.autoDispose.family<ProductDetail, String>((ref, id) async {
  final lang = ref.watch(localeControllerProvider).languageCode;
  final result = await ref.watch(productRepositoryProvider).detail(id, lang);
  return result.unwrapOrThrow();
});
