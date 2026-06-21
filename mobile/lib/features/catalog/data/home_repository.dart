import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/home_section.dart';
import 'home_api.dart';

final homeRepositoryProvider =
    Provider<HomeRepository>((ref) => HomeRepository(ref.watch(homeApiProvider)));

class HomeRepository {
  HomeRepository(this._api);
  final HomeApi _api;

  Future<Result<List<HomeSection>>> getLayout() async {
    try {
      final raw = await _api.getLayout();
      final sections = raw
          .whereType<Map>()
          .map((e) => HomeSection.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      return Success(sections);
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

/// The home layout as an AsyncValue (loading/error/data). Invalidate to refresh.
final homeProvider = FutureProvider<List<HomeSection>>((ref) async {
  final result = await ref.watch(homeRepositoryProvider).getLayout();
  return result.unwrapOrThrow();
});
