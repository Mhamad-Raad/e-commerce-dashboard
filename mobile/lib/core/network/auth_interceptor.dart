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

  // 401s here mean bad credentials/OTP, not an expired access token — never
  // refresh-and-retry them. Authenticated auth routes (me, profile, logout,
  // change-password, avatar) are NOT listed: they must go through refresh,
  // otherwise every cold start after access expiry logs the user out.
  static const _noRefreshPaths = [
    '/app/auth/register',
    '/app/auth/verify-phone',
    '/app/auth/resend-otp',
    '/app/auth/login',
    '/app/auth/forgot-password',
    '/app/auth/reset-password',
    '/app/auth/refresh',
  ];

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
    final path = err.requestOptions.path;
    final isPublicAuthRoute = _noRefreshPaths.any(path.contains);
    final alreadyRetried = err.requestOptions.extra['__retried'] == true;

    if (err.response?.statusCode != 401 || isPublicAuthRoute || alreadyRetried) {
      return handler.next(err);
    }

    // Creator clears the shared future (whenComplete), so a late 401 can't
    // race a second refresh with the already-rotated token.
    final refreshed = await (_refreshing ??=
        _refresh().whenComplete(() => _refreshing = null));

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

  // A Dio without this interceptor, so refresh + retry don't recurse. Mirrors
  // the main client's timeouts — without them a stalled refresh POST would leave
  // the shared _refreshing future pending forever and hang all 401 handling.
  Dio _bareDio() {
    final config = _ref.read(appConfigProvider);
    return Dio(
      BaseOptions(
        baseUrl: config.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
        contentType: 'application/json',
      ),
    );
  }
}
