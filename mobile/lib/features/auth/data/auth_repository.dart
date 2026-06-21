import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/error/failure.dart';
import '../../../core/network/api_result.dart';
import '../domain/customer.dart';
import 'auth_api.dart';
import 'models/auth_session.dart';

final authRepositoryProvider =
    Provider<AuthRepository>((ref) => AuthRepository(ref.watch(authApiProvider)));

/// Wraps [AuthApi] calls in [Result], translating backend errors to typed
/// [Failure]s (including the auth-specific PHONE_NOT_VERIFIED / 409 / 429 cases).
class AuthRepository {
  AuthRepository(this._api);
  final AuthApi _api;

  Future<Result<void>> register({
    required String name,
    required String phone,
    required String password,
    String? email,
  }) =>
      _guardVoid(() => _api.register(
            name: name,
            phone: phone,
            password: password,
            email: email,
          ));

  Future<Result<AuthSession>> verifyPhone({
    required String phone,
    required String code,
  }) =>
      _guard(() async =>
          AuthSession.fromJson(await _api.verifyPhone(phone: phone, code: code)));

  Future<Result<AuthSession>> login({
    required String phone,
    required String password,
  }) =>
      _guard(() async =>
          AuthSession.fromJson(await _api.login(phone: phone, password: password)));

  Future<Result<void>> forgotPassword(String phone) =>
      _guardVoid(() => _api.forgotPassword(phone));

  Future<Result<void>> resetPassword({
    required String phone,
    required String code,
    required String newPassword,
  }) =>
      _guardVoid(() => _api.resetPassword(
            phone: phone,
            code: code,
            newPassword: newPassword,
          ));

  Future<Result<void>> resendOtp({
    required String phone,
    required String purpose,
  }) =>
      _guardVoid(() => _api.resendOtp(phone: phone, purpose: purpose));

  Future<Result<Customer>> me() =>
      _guard(() async => Customer.fromJson(await _api.me()));

  Future<Result<void>> logout(String? refreshToken) =>
      _guardVoid(() => _api.logout(refreshToken));

  Future<Result<T>> _guard<T>(Future<T> Function() run) async {
    try {
      return Success(await run());
    } catch (e) {
      return Failed(_mapAuthError(e));
    }
  }

  Future<Result<void>> _guardVoid(Future<void> Function() run) async {
    try {
      await run();
      return const Success(null);
    } catch (e) {
      return Failed(_mapAuthError(e));
    }
  }
}

/// Auth-aware error mapping. Falls back to the shared [mapError] for anything
/// not specific to auth (network, timeouts, unknown).
Failure _mapAuthError(Object error) {
  if (error is DioException &&
      error.type == DioExceptionType.badResponse &&
      error.response != null) {
    final code = error.response!.statusCode;
    final data = error.response!.data;
    final body = data is Map ? data : const <dynamic, dynamic>{};
    final message = body['message']?.toString();
    final errorCode = body['code']?.toString();

    if (code == 403 && errorCode == 'PHONE_NOT_VERIFIED') {
      return PhoneNotVerifiedFailure(message ?? 'Phone number not verified');
    }
    if (code == 409) return ConflictFailure(message ?? 'Already registered');
    if (code == 429) return const RateLimitFailure();
    if (code == 401 || code == 403) {
      return AuthFailure(message ?? 'Authentication failed');
    }
    if (code == 400 || code == 422) {
      return ValidationFailure(message ?? 'Invalid request');
    }
  }
  return mapError(error);
}
