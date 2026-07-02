import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

final authApiProvider = Provider<AuthApi>((ref) => AuthApi(ref.watch(dioProvider)));

/// Thin transport over the backend's /api/app/auth routes. Returns the decoded
/// body map and lets DioExceptions bubble — the repository maps them to Failures.
class AuthApi {
  AuthApi(this._dio);
  final Dio _dio;

  Future<Map<String, dynamic>> register({
    required String name,
    required String gender,
    required String phone,
    required String password,
    String? email,
  }) =>
      _post('/app/auth/register', {
        'name': name,
        'gender': gender,
        'phone': phone,
        'password': password,
        if (email != null && email.isNotEmpty) 'email': email,
      });

  Future<Map<String, dynamic>> verifyPhone({
    required String phone,
    required String code,
  }) =>
      _post('/app/auth/verify-phone', {'phone': phone, 'code': code});

  Future<Map<String, dynamic>> login({
    required String phone,
    required String password,
  }) =>
      _post('/app/auth/login', {'phone': phone, 'password': password});

  Future<Map<String, dynamic>> forgotPassword(String phone) =>
      _post('/app/auth/forgot-password', {'phone': phone});

  Future<Map<String, dynamic>> resetPassword({
    required String phone,
    required String code,
    required String newPassword,
  }) =>
      _post('/app/auth/reset-password', {
        'phone': phone,
        'code': code,
        'newPassword': newPassword,
      });

  Future<Map<String, dynamic>> resendOtp({
    required String phone,
    required String purpose,
  }) =>
      _post('/app/auth/resend-otp', {'phone': phone, 'purpose': purpose});

  Future<Map<String, dynamic>> logout(String? refreshToken) => _post(
        '/app/auth/logout',
        {'refreshToken': ?refreshToken},
      );

  Future<Map<String, dynamic>> me() async {
    final res = await _dio.get('/app/auth/me');
    return _asMap(res.data);
  }

  Future<Map<String, dynamic>> updateProfile(
      {String? name, String? email, String? gender}) async {
    final res = await _dio.patch('/app/auth/profile', data: {
      'name': ?name,
      'email': ?email,
      'gender': ?gender,
    });
    return _asMap(res.data);
  }

  /// Deactivates the account server-side and revokes every session.
  Future<Map<String, dynamic>> deleteAccount() =>
      _post('/app/auth/delete-account', {});

  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) =>
      _post('/app/auth/change-password', {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });

  Future<Map<String, dynamic>> uploadAvatar(String filePath) async {
    Future<Response<dynamic>> attempt() async {
      // Fresh FormData per attempt — a multipart stream can only be sent once,
      // so the auth interceptor can't replay it after a token refresh.
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
      });
      return _dio.post('/app/auth/avatar', data: form);
    }

    try {
      return _asMap((await attempt()).data);
    } on DioException catch (e) {
      // The interceptor refreshed the token but propagated the 401 (it can't
      // rebuild the body) — one retry with a new stream and the fresh token.
      if (e.response?.statusCode != 401) rethrow;
      return _asMap((await attempt()).data);
    }
  }

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final res = await _dio.post(path, data: body);
    return _asMap(res.data);
  }

  Map<String, dynamic> _asMap(dynamic data) =>
      data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
}
