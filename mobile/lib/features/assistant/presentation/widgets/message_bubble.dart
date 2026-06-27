import 'package:flutter/material.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../domain/chat_message.dart';

/// A single chat bubble — user messages trail (end), assistant messages lead
/// (start). RTL-safe via directional alignment.
class MessageBubble extends StatelessWidget {
  const MessageBubble({super.key, required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isUser = message.isUser;
    final bg = isUser ? scheme.primary : scheme.surfaceContainerHighest;
    final fg = isUser ? scheme.onPrimary : scheme.onSurface;
    const radius = Radius.circular(AppSpacing.md);

    return Align(
      alignment:
          isUser ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
        padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.78,
        ),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadiusDirectional.only(
            topStart: radius,
            topEnd: radius,
            bottomStart: isUser ? radius : Radius.zero,
            bottomEnd: isUser ? Radius.zero : radius,
          ),
        ),
        child: Text(
          message.content,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: fg),
        ),
      ),
    );
  }
}
