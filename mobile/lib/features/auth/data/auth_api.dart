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
    required String phone,
    required String password,
    String? email,
  }) =>
      _post('/app/auth/register', {
        'name': name,
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

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    final res = await _dio.post(path, data: body);
    return _asMap(res.data);
  }

  Map<String, dynamic> _asMap(dynamic data) =>
      data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
}
