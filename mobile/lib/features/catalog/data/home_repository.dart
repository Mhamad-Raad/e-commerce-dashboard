import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/home_data.dart';
import 'home_api.dart';

final homeRepositoryProvider =
    Provider<HomeRepository>((ref) => HomeRepository(ref.watch(homeApiProvider)));

class HomeRepository {
  HomeRepository(this._api);
  final HomeApi _api;

  Future<Result<HomeData>> getHome() async {
    try {
      return Success(HomeData.fromJson(await _api.getHomepage()));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

/// Storefront landing data as an AsyncValue (loading/error/data). Invalidate to
/// refresh (pull-to-refresh / retry).
final homeProvider = FutureProvider<HomeData>((ref) async {
  final result = await ref.watch(homeRepositoryProvider).getHome();
  return result.unwrapOrThrow();
});
