import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/token_store.dart';

/// Attaches the access token. Refresh-on-401 with rotation + single-flight
/// is added once the backend refresh endpoint exists (see MOBILE_ARCHITECTURE.md §6).
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._ref);
  final Ref _ref;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _ref.read(tokenStoreProvider).accessToken;
    if (token != null && !options.headers.containsKey('Authorization')) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  // TODO(auth): on 401 → single-flight refresh (rotate access+refresh,
  // persist new pair, retry original). On refresh failure → clear tokens.
}
