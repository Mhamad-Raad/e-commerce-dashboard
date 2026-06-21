import 'package:dio/dio.dart';

import 'failure.dart';

/// Maps a thrown error (usually a DioException) to a typed [Failure].
/// Used inside repository impls to wrap calls in a Result.
Failure mapError(Object error) {
  if (error is Failure) return error;
  if (error is DioException) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const NetworkFailure();
      case DioExceptionType.badResponse:
        final code = error.response?.statusCode;
        if (code == 401 || code == 403) return const AuthFailure();
        if (code == 422 || code == 400) {
          return ValidationFailure(_message(error) ?? 'Invalid request');
        }
        return ServerFailure(_message(error) ?? 'Server error', statusCode: code);
      default:
        return const UnknownFailure();
    }
  }
  return const UnknownFailure();
}

String? _message(DioException e) {
  final data = e.response?.data;
  if (data is Map && data['message'] != null) return data['message'].toString();
  return null;
}
