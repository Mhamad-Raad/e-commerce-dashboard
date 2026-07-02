import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/error/failure.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/dio_client.dart';
import '../domain/chat_message.dart';

final assistantRepositoryProvider = Provider<AssistantRepository>(
    (ref) => AssistantRepository(ref.watch(dioProvider)));

/// Talks to the customer-scoped assistant API (`/app/assistant`). The customer
/// is resolved server-side from the JWT, so we never send a customer id.
class AssistantRepository {
  AssistantRepository(this._dio);
  final Dio _dio;

  /// Sends one chat turn. Pass the [conversationId] returned by the previous
  /// turn to keep the thread going (null starts a new conversation). [language]
  /// is a human-readable reply-language hint (e.g. "Kurdish Sorani").
  Future<Result<ChatReply>> send({
    String? conversationId,
    required String message,
    String? language,
  }) async {
    try {
      final res = await _dio.post('/app/assistant/chat', data: {
        'message': message,
        'conversationId': ?conversationId,
        'language': ?language,
      });
      return Success(
          ChatReply.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  /// Sends one GUEST chat turn (logged-out trial) to `/app/assistant/guest/chat`,
  /// identified by [deviceId] instead of a JWT. The reply's
  /// `guestMessagesRemaining` drives the login wall. A 403 with code
  /// `GUEST_LIMIT_REACHED` (the server backstop, e.g. after an app restart when
  /// the local counter has reset) maps to [GuestLimitFailure] so the UI can show
  /// the wall rather than a generic error — the global mapper collapses all 403s
  /// to AuthFailure, so we special-case it here before delegating.
  Future<Result<ChatReply>> sendGuest({
    required String deviceId,
    String? conversationId,
    required String message,
    String? language,
  }) async {
    try {
      final res = await _dio.post('/app/assistant/guest/chat', data: {
        'deviceId': deviceId,
        'message': message,
        'conversationId': ?conversationId,
        'language': ?language,
      });
      return Success(
          ChatReply.fromJson(Map<String, dynamic>.from(res.data as Map)));
    } on DioException catch (e) {
      final data = e.response?.data;
      if (e.response?.statusCode == 403 &&
          data is Map &&
          data['code'] == 'GUEST_LIMIT_REACHED') {
        return const Failed(GuestLimitFailure());
      }
      return Failed(mapError(e));
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}
