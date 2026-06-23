import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../../catalog/domain/catalog_product.dart';
import 'favorites_api.dart';

final favoritesRepositoryProvider = Provider<FavoritesRepository>(
    (ref) => FavoritesRepository(ref.watch(favoritesApiProvider)));

class FavoritesRepository {
  FavoritesRepository(this._api);
  final FavoritesApi _api;

  Future<Result<List<CatalogProduct>>> list(String lang) async {
    try {
      final raw = await _api.getAll(lang);
      final products = raw
          .whereType<Map>()
          .map((e) => CatalogProduct.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      return Success(products);
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<void>> add(String productId) async {
    try {
      await _api.add(productId);
      return const Success(null);
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<void>> remove(String productId) async {
    try {
      await _api.remove(productId);
      return const Success(null);
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}
