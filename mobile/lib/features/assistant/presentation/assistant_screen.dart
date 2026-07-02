import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import 'providers/assistant_chat_controller.dart';
import 'widgets/assistant_chat_widgets.dart';
import 'widgets/message_bubble.dart';

/// Assistant tab — the AI shopping assistant chat. Wired end-to-end to
/// `/app/assistant`; the backend stays dormant (503) until ANTHROPIC_API_KEY is
/// configured, which surfaces here as a friendly "unavailable" message.
class AssistantScreen extends ConsumerStatefulWidget {
  const AssistantScreen({super.key});

  @override
  ConsumerState<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends ConsumerState<AssistantScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final text = _input.text;
    if (text.trim().isEmpty) return;
    // Guard the keyboard "send" path too (the button is already disabled while
    // sending) — otherwise Enter mid-reply would clear the field without sending.
    if (ref.read(assistantChatControllerProvider).sending) return;
    _input.clear();
    ref.read(assistantChatControllerProvider.notifier).send(text);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = ref.watch(assistantChatControllerProvider);

    // Keep the transcript pinned to the latest message/indicator.
    ref.listen(assistantChatControllerProvider, (_, _) => _scrollToBottom());

    final isEmpty =
        state.messages.isEmpty && !state.sending && state.error == null;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.assistantTitle),
        actions: [
          if (state.messages.isNotEmpty)
            IconButton(
              tooltip: l10n.assistantNewChat,
              onPressed: () {
                _input.clear();
                ref.read(assistantChatControllerProvider.notifier).newChat();
              },
              icon: const Icon(Icons.add_comment_outlined),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: isEmpty
                ? const AssistantEmptyState()
                : _transcript(context, state),
          ),
          AssistantInputBar(
            controller: _input,
            sending: state.sending,
            onSend: _send,
          ),
        ],
      ),
    );
  }

  Widget _transcript(BuildContext context, AssistantChatState state) {
    final l10n = context.l10n;
    return ListView(
      controller: _scroll,
      padding: const EdgeInsets.all(AppSpacing.margin),
      children: [
        for (final m in state.messages) ...[
          MessageBubble(message: m),
          if (!m.isUser && m.products.isNotEmpty)
            AssistantProductsStrip(products: m.products),
        ],
        if (state.sending) const AssistantTypingIndicator(),
        if (state.error != null)
          AssistantErrorRow(
            text: assistantErrorText(state.error!, l10n),
            onRetry: () =>
                ref.read(assistantChatControllerProvider.notifier).retry(),
          ),
      ],
    );
  }
}
