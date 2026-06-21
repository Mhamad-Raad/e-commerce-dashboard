import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/blog_post.dart';
import 'blog_api.dart';

final blogRepositoryProvider =
    Provider<BlogRepository>((ref) => BlogRepository(ref.watch(blogApiProvider)));

class BlogRepository {
  BlogRepository(this._api);
  final BlogApi _api;

  Future<Result<BlogPost>> getPost(String id) async {
    try {
      return Success(BlogPost.fromJson(await _api.getPost(id)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}

/// A single article as an AsyncValue, keyed by id.
final blogPostProvider = FutureProvider.family<BlogPost, String>((ref, id) async {
  final result = await ref.watch(blogRepositoryProvider).getPost(id);
  return result.unwrapOrThrow();
});
