import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import 'providers/guest_assistant_controller.dart';
import 'widgets/assistant_chat_widgets.dart';
import 'widgets/message_bubble.dart';

/// The assistant for logged-OUT visitors: a short, capped trial reachable from
/// the login screen, so people can experience the skincare consultation before
/// signing up. Lives OUTSIDE the authenticated tab shell. After the free turns
/// are spent, the composer is replaced by a login wall. Signed-in customers use
/// [AssistantScreen] in the Assistant tab instead.
class GuestAssistantScreen extends ConsumerStatefulWidget {
  const GuestAssistantScreen({super.key});

  @override
  ConsumerState<GuestAssistantScreen> createState() =>
      _GuestAssistantScreenState();
}

class _GuestAssistantScreenState extends ConsumerState<GuestAssistantScreen> {
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
    final state = ref.read(guestAssistantControllerProvider);
    if (state.sending || state.limitReached) return;
    _input.clear();
    ref.read(guestAssistantControllerProvider.notifier).send(text);
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
    final state = ref.watch(guestAssistantControllerProvider);

    // Keep the transcript pinned to the latest message/indicator.
    ref.listen(guestAssistantControllerProvider, (_, _) => _scrollToBottom());

    final isEmpty =
        state.messages.isEmpty && !state.sending && state.error == null;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.assistantTitle),
        actions: [
          TextButton(
            onPressed: () => context.go(Routes.login),
            child: Text(l10n.logIn),
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
          if (state.limitReached)
            const _LoginWall()
          else ...[
            if (state.remaining > 0) _RemainingHint(remaining: state.remaining),
            AssistantInputBar(
              controller: _input,
              sending: state.sending,
              onSend: _send,
            ),
          ],
        ],
      ),
    );
  }

  Widget _transcript(BuildContext context, GuestChatState state) {
    final l10n = context.l10n;
    return ListView(
      controller: _scroll,
      padding: const EdgeInsets.all(AppSpacing.margin),
      children: [
        for (final m in state.messages) ...[
          MessageBubble(message: m),
          if (!m.isUser && m.products.isNotEmpty)
            AssistantProductsStrip(products: m.products, guest: true),
        ],
        if (state.sending) const AssistantTypingIndicator(),
        if (state.error != null)
          AssistantErrorRow(
            text: assistantErrorText(state.error!, l10n),
            onRetry: () =>
                ref.read(guestAssistantControllerProvider.notifier).retry(),
          ),
      ],
    );
  }
}

/// Subtle "N free messages left" caption above the composer.
class _RemainingHint extends StatelessWidget {
  const _RemainingHint({required this.remaining});

  final int remaining;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.sm),
      child: Text(
        context.l10n.assistantGuestRemaining(remaining),
        textAlign: TextAlign.center,
        style: Theme.of(context)
            .textTheme
            .bodySmall
            ?.copyWith(color: scheme.onSurfaceVariant),
      ),
    );
  }
}

/// Replaces the composer once the free trial is spent: a prompt to log in or
/// create an account to keep chatting.
class _LoginWall extends StatelessWidget {
  const _LoginWall();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return SafeArea(
      top: false,
      child: Container(
        width: double.infinity,
        margin: const EdgeInsets.all(AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest,
          borderRadius: AppRadii.cardRadius,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, color: scheme.primary),
            const SizedBox(height: AppSpacing.sm),
            Text(l10n.assistantGuestWallTitle,
                style: text.titleMedium, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.xs),
            Text(l10n.assistantGuestWallBody,
                style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.md),
            PrimaryButton(
              label: l10n.logIn,
              onPressed: () => context.go(Routes.login),
            ),
            TextButton(
              onPressed: () => context.go(Routes.signup),
              child: Text(l10n.createAccount),
            ),
          ],
        ),
      ),
    );
  }
}
