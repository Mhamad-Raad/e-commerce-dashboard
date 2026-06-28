import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/locale/locale_controller.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../../data/assistant_repository.dart';
import '../../domain/chat_message.dart';

/// The assistant chat screen's state: the running transcript, whether a reply is
/// in flight, the last error (if any), and the server conversation id that keeps
/// the thread coherent across turns.
class AssistantChatState {
  const AssistantChatState({
    this.messages = const [],
    this.sending = false,
    this.error,
    this.conversationId,
  });

  final List<ChatMessage> messages;
  final bool sending;
  final Failure? error;
  final String? conversationId;

  AssistantChatState copyWith({
    List<ChatMessage>? messages,
    bool? sending,
    Failure? error,
    bool clearError = false,
    String? conversationId,
  }) =>
      AssistantChatState(
        messages: messages ?? this.messages,
        sending: sending ?? this.sending,
        error: clearError ? null : (error ?? this.error),
        conversationId: conversationId ?? this.conversationId,
      );
}

final assistantChatControllerProvider =
    NotifierProvider<AssistantChatController, AssistantChatState>(
        AssistantChatController.new);

class AssistantChatController extends Notifier<AssistantChatState> {
  AssistantRepository get _repo => ref.read(assistantRepositoryProvider);

  /// Human-readable reply-language hint for the backend system prompt.
  String get _languageHint => switch (ref.read(localeControllerProvider).languageCode) {
        'ar' => 'Arabic',
        'ckb' => 'Kurdish Sorani',
        _ => 'English',
      };

  @override
  AssistantChatState build() {
    // Clear the transcript on logout so a shared device never shows one
    // customer's chat to the next (the controller is kept alive across the
    // tab shell, so it won't reset on its own).
    ref.listen(authControllerProvider, (_, next) {
      if (next.status == AuthStatus.unauthenticated) {
        state = const AssistantChatState();
      }
    });
    return const AssistantChatState();
  }

  /// Send a new user message and request the assistant's reply.
  Future<void> send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || state.sending) return;
    state = state.copyWith(
      messages: [...state.messages, ChatMessage.user(trimmed)],
      clearError: true,
    );
    await _request(trimmed);
  }

  /// Retry the last turn after a failure (re-sends the last user message without
  /// adding another bubble).
  Future<void> retry() async {
    if (state.sending) return;
    ChatMessage? lastUser;
    for (final m in state.messages.reversed) {
      if (m.role == ChatRole.user) {
        lastUser = m;
        break;
      }
    }
    if (lastUser == null) return;
    await _request(lastUser.content);
  }

  /// Clear the transcript and start a fresh conversation.
  void newChat() => state = const AssistantChatState();

  Future<void> _request(String message) async {
    state = state.copyWith(sending: true, clearError: true);
    final result = await _repo.send(
      conversationId: state.conversationId,
      message: message,
      language: _languageHint,
    );
    switch (result) {
      case Success(value: final reply):
        state = state.copyWith(
          messages: [
            ...state.messages,
            ChatMessage.assistant(reply.message, products: reply.products),
          ],
          conversationId: reply.conversationId,
          sending: false,
        );
      case Failed(failure: final f):
        state = state.copyWith(sending: false, error: f);
    }
  }
}
