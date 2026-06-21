import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale/locale_controller.dart';
import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/home_section.dart';
import 'home_api.dart';

final homeRepositoryProvider =
    Provider<HomeRepository>((ref) => HomeRepository(ref.watch(homeApiProvider)));

class HomeRepository {
  HomeRepository(this._api);
  final HomeApi _api;

  Future<Result<List<HomeSection>>> getLayout(String lang) async {
    try {
      final raw = await _api.getLayout(lang);
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

/// The home layout as an AsyncValue. Watches the locale, so switching language
/// refetches the layout resolved to the new language.
final homeProvider = FutureProvider<List<HomeSection>>((ref) async {
  final lang = ref.watch(localeControllerProvider).languageCode;
  final result = await ref.watch(homeRepositoryProvider).getLayout(lang);
  return result.unwrapOrThrow();
});
