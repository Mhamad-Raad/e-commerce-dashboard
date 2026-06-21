import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale/locale_controller.dart';
import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/blog_post.dart';
import 'blog_api.dart';

final blogRepositoryProvider =
    Provider<BlogRepository>((ref) => BlogRepository(ref.watch(blogApiProvider)));

class BlogRepository {
  BlogRepository(this._api);
  final BlogApi _api;

  Future<Result<BlogPost>> getPost(String id, String lang) async {
    try {
      return Success(BlogPost.fromJson(await _api.getPost(id, lang)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

/// A single article as an AsyncValue, keyed by id. Watches the locale so the
/// article refetches in the new language on switch.
final blogPostProvider = FutureProvider.family<BlogPost, String>((ref, id) async {
  final lang = ref.watch(localeControllerProvider).languageCode;
  final result = await ref.watch(blogRepositoryProvider).getPost(id, lang);
  return result.unwrapOrThrow();
});
