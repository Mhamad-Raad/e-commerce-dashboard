import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/locale/locale_controller.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/storage/prefs.dart';
import '../../../auth/presentation/providers/auth_controller.dart';
import '../../data/assistant_repository.dart';
import '../../domain/chat_message.dart';

/// Free turns a logged-out guest gets before the login wall. Mirrors the backend
/// cap (GUEST_MESSAGE_LIMIT); the server is authoritative — it returns the real
/// remaining count on each reply and returns a [GuestLimitFailure] backstop — so
/// a drift here only affects the initial "messages left" hint.
const kGuestFreeMessages = 3;

/// State for the guest (unauthenticated) assistant trial: the transcript, the
/// in-flight flag, the last error, the server conversation id, how many free
/// turns remain, and whether the login wall should show.
class GuestChatState {
  const GuestChatState({
    this.messages = const [],
    this.sending = false,
    this.error,
    this.conversationId,
    this.remaining = kGuestFreeMessages,
    this.limitReached = false,
  });

  final List<ChatMessage> messages;
  final bool sending;
  final Failure? error;
  final String? conversationId;
  final int remaining;
  final bool limitReached;

  GuestChatState copyWith({
    List<ChatMessage>? messages,
    bool? sending,
    Failure? error,
    bool clearError = false,
    String? conversationId,
    int? remaining,
    bool? limitReached,
  }) =>
      GuestChatState(
        messages: messages ?? this.messages,
        sending: sending ?? this.sending,
        error: clearError ? null : (error ?? this.error),
        conversationId: conversationId ?? this.conversationId,
        remaining: remaining ?? this.remaining,
        limitReached: limitReached ?? this.limitReached,
      );
}

final guestAssistantControllerProvider =
    NotifierProvider<GuestAssistantController, GuestChatState>(
        GuestAssistantController.new);

class GuestAssistantController extends Notifier<GuestChatState> {
  AssistantRepository get _repo => ref.read(assistantRepositoryProvider);

  String get _deviceId => ref.read(prefsProvider).guestDeviceId();

  /// Human-readable reply-language hint for the backend system prompt.
  String get _languageHint =>
      switch (ref.read(localeControllerProvider).languageCode) {
        'ar' => 'Arabic',
        'ckb' => 'Kurdish Sorani',
        _ => 'English',
      };

  @override
  GuestChatState build() {
    // Drop the guest transcript once the visitor signs in (from the login wall
    // or elsewhere) so a shared device never shows the previous guest's trial
    // chat after a later logout. Mirrors the authenticated controller, which
    // clears on logout.
    ref.listen(authControllerProvider, (_, next) {
      if (next.status == AuthStatus.authenticated) {
        state = const GuestChatState();
      }
    });
    return const GuestChatState();
  }

  /// Send a new guest message. No-op once the free quota is spent (the wall is
  /// showing) or while a reply is in flight.
  Future<void> send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || state.sending || state.limitReached) return;
    state = state.copyWith(
      messages: [...state.messages, ChatMessage.user(trimmed)],
      clearError: true,
    );
    await _request(trimmed);
  }

  /// Retry the last turn after a transient failure (re-sends the last user
  /// message without adding another bubble).
  Future<void> retry() async {
    if (state.sending || state.limitReached) return;
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

  Future<void> _request(String message) async {
    state = state.copyWith(sending: true, clearError: true);
    final result = await _repo.sendGuest(
      deviceId: _deviceId,
      conversationId: state.conversationId,
      message: message,
      language: _languageHint,
    );
    switch (result) {
      case Success(value: final reply):
        final remaining = reply.guestMessagesRemaining ?? state.remaining;
        state = state.copyWith(
          messages: [
            ...state.messages,
            ChatMessage.assistant(reply.message, products: reply.products),
          ],
          conversationId: reply.conversationId,
          sending: false,
          remaining: remaining,
          limitReached: remaining <= 0,
        );
      case Failed(failure: GuestLimitFailure()):
        // Server backstop (e.g. the local counter reset on app restart, but the
        // device's quota was already spent) → show the wall.
        state = state.copyWith(sending: false, remaining: 0, limitReached: true);
      case Failed(failure: final f):
        state = state.copyWith(sending: false, error: f);
    }
  }
}
