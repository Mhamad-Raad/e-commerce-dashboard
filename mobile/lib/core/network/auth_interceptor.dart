import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/env/env.dart';
import '../../features/auth/presentation/providers/auth_controller.dart';
import '../storage/token_store.dart';

/// Attaches the access token, and on a 401 performs a single-flight refresh
/// (rotation: the backend returns a new access+refresh and invalidates the old
/// refresh), then retries the original request once. If refresh fails, the
/// session is cleared and the router redirects to login.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._ref);
  final Ref _ref;

  // Shared across concurrent 401s so we refresh once, not once per request.
  Future<bool>? _refreshing;

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

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final isAuthRoute = err.requestOptions.path.contains('/app/auth/');
    final alreadyRetried = err.requestOptions.extra['__retried'] == true;

    // Only act on an expired access token on a normal (non-auth) request, once.
    if (err.response?.statusCode != 401 || isAuthRoute || alreadyRetried) {
      return handler.next(err);
    }

    final refreshed = await (_refreshing ??= _refresh());
    _refreshing = null;

    if (!refreshed) {
      _ref.read(authControllerProvider.notifier).onSessionExpired();
      return handler.next(err);
    }

    try {
      final newAccess = await _ref.read(tokenStoreProvider).accessToken;
      final options = err.requestOptions
        ..extra['__retried'] = true
        ..headers['Authorization'] = 'Bearer $newAccess';
      final response = await _bareDio().fetch<dynamic>(options);
      return handler.resolve(response);
    } catch (_) {
      return handler.next(err);
    }
  }

  Future<bool> _refresh() async {
    final store = _ref.read(tokenStoreProvider);
    final refresh = await store.refreshToken;
    if (refresh == null) return false;
    try {
      final response = await _bareDio()
          .post('/app/auth/refresh', data: {'refreshToken': refresh});
      final data = response.data as Map;
      await store.save(
        access: data['accessToken'] as String,
        refresh: data['refreshToken'] as String,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // A Dio without this interceptor, so refresh + retry don't recurse.
  Dio _bareDio() {
    final config = _ref.read(appConfigProvider);
    return Dio(
      BaseOptions(baseUrl: config.apiBaseUrl, contentType: 'application/json'),
    );
  }
}
