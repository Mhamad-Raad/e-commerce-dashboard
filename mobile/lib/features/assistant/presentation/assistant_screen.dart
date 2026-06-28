import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/error/failure.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../l10n/app_localizations.dart';
import '../../catalog/domain/catalog_product.dart';
import '../../catalog/presentation/home/widgets/product_card.dart';
import 'providers/assistant_chat_controller.dart';
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
            child: isEmpty ? const _Empty() : _transcript(context, state),
          ),
          _InputBar(
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
            _AssistantProducts(products: m.products),
        ],
        if (state.sending) const _TypingIndicator(),
        if (state.error != null)
          _ErrorRow(
            text: _errorText(state.error!, l10n),
            onRetry: () =>
                ref.read(assistantChatControllerProvider.notifier).retry(),
          ),
      ],
    );
  }
}

/// 503 (key not configured) / disabled → friendly "unavailable"; anything else
/// is a generic transient error.
String _errorText(Failure f, AppLocalizations l10n) {
  if (f is ServerFailure && f.statusCode == 503) return l10n.assistantUnavailable;
  if (f is AuthFailure) return l10n.assistantUnavailable;
  return l10n.assistantError;
}

class _Empty extends StatelessWidget {
  const _Empty();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.auto_awesome_outlined, size: 48, color: scheme.primary),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.assistantEmptyTitle,
                style: text.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.sm),
            Text(l10n.assistantEmptyBody,
                style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

/// Horizontal strip of product cards under an assistant message. Reuses the
/// catalog [ProductCard], so each card already carries tap-to-detail, add-to-cart,
/// and wishlist — exactly the actions we want from the chat.
class _AssistantProducts extends StatelessWidget {
  const _AssistantProducts({required this.products});

  final List<CatalogProduct> products;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: SizedBox(
        height: 280,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
          itemCount: products.length,
          separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
          itemBuilder: (_, i) => SizedBox(
            width: 160,
            child: ProductCard(
              product: products[i],
              onTap: () => context.push(Routes.productDetail(products[i].id)),
            ),
          ),
        ),
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Align(
      alignment: AlignmentDirectional.centerStart,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest,
          borderRadius: AppRadii.cardRadius,
        ),
        child: SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(strokeWidth: 2, color: scheme.primary),
        ),
      ),
    );
  }
}

class _ErrorRow extends StatelessWidget {
  const _ErrorRow({required this.text, required this.onRetry});

  final String text;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Align(
      alignment: AlignmentDirectional.centerStart,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
            child: Text(text, style: TextStyle(color: scheme.error)),
          ),
          TextButton(onPressed: onRetry, child: Text(context.l10n.retry)),
        ],
      ),
    );
  }
}

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.sending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.sm),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
                decoration: InputDecoration(
                  hintText: l10n.assistantInputHint,
                  filled: true,
                  fillColor:
                      scheme.surfaceContainerHighest.withValues(alpha: 0.5),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                  border: const OutlineInputBorder(
                    borderRadius: AppRadii.pill,
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton.filled(
              onPressed: sending ? null : onSend,
              icon: const Icon(Icons.send),
            ),
          ],
        ),
      ),
    );
  }
}
