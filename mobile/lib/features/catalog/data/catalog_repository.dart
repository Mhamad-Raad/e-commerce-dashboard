import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale/locale_controller.dart';
import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/dio_client.dart';
import '../domain/catalog_category.dart';
import '../domain/catalog_store.dart';
import '../domain/product_query.dart';
import '../domain/store_detail.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>(
    (ref) => CatalogRepository(ref.watch(dioProvider)));

/// Reads for the browse experience: product search, categories, stores.
class CatalogRepository {
  CatalogRepository(this._dio);
  final Dio _dio;

  Future<Result<ProductPage>> searchProducts(
    ProductQuery query,
    String lang, {
    required int page,
    int pageSize = 20,
  }) async {
    try {
      final res = await _dio.get('/app/products',
          queryParameters: query.toParams(lang, page: page, pageSize: pageSize));
      return Success(ProductPage.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<List<CatalogCategory>>> categories(String lang) =>
      _list('/app/categories', lang, CatalogCategory.fromJson);

  Future<Result<List<CatalogStore>>> stores(String lang) =>
      _list('/app/stores', lang, CatalogStore.fromJson);

  Future<Result<StoreDetail>> store(String id, String lang) async {
    try {
      final res =
          await _dio.get('/app/stores/$id', queryParameters: {'lang': lang});
      return Success(StoreDetail.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<List<T>>> _list<T>(
    String path,
    String lang,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    try {
      final res = await _dio.get(path, queryParameters: {'lang': lang});
      final raw = res.data is List ? res.data as List : const [];
      return Success(raw
          .whereType<Map>()
          .map((e) => fromJson(Map<String, dynamic>.from(e)))
          .toList());
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

final _langProvider =
    Provider<String>((ref) => ref.watch(localeControllerProvider).languageCode);

/// Active categories for the filter sheet (resolved to the current language).
final catalogCategoriesProvider =
    FutureProvider.autoDispose<List<CatalogCategory>>((ref) async {
  final lang = ref.watch(_langProvider);
  final result = await ref.watch(catalogRepositoryProvider).categories(lang);
  return result.unwrapOrThrow();
});

/// All stores/brands for the Stores screen.
final catalogStoresProvider =
    FutureProvider.autoDispose<List<CatalogStore>>((ref) async {
  final lang = ref.watch(_langProvider);
  final result = await ref.watch(catalogRepositoryProvider).stores(lang);
  return result.unwrapOrThrow();
});

/// One store with its products.
final storeDetailProvider =
    FutureProvider.autoDispose.family<StoreDetail, String>((ref, id) async {
  final lang = ref.watch(_langProvider);
  final result = await ref.watch(catalogRepositoryProvider).store(id, lang);
  return result.unwrapOrThrow();
});
