import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
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
}
