import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_radii.dart';
import '../../../../app/theme/app_sizes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../catalog/domain/catalog_product.dart';
import '../../../catalog/presentation/home/widgets/product_card.dart';

/// Presentational pieces shared by the authenticated [AssistantScreen] and the
/// guest trial screen, so both render the transcript identically. Kept free of
/// any controller/provider dependency — callers pass in data and callbacks.

/// 503 (key not configured) / disabled → friendly "unavailable"; anything else
/// is a generic transient error.
String assistantErrorText(Failure f, AppLocalizations l10n) {
  if (f is ServerFailure && f.statusCode == 503) return l10n.assistantUnavailable;
  if (f is AuthFailure) return l10n.assistantUnavailable;
  return l10n.assistantError;
}

/// Centered intro shown before the first message.
class AssistantEmptyState extends StatelessWidget {
  const AssistantEmptyState({super.key});

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

/// Horizontal strip of product cards under an assistant message. For signed-in
/// users it reuses the full catalog [ProductCard] (tap-to-detail, add-to-cart,
/// wishlist). For the [guest] trial those actions all require an account, so the
/// cards render as non-interactive previews and a tap routes to sign-up instead
/// of the auth-gated product detail — a clean conversion nudge rather than a
/// dead-end bounce to the login screen.
class AssistantProductsStrip extends StatelessWidget {
  const AssistantProductsStrip({
    super.key,
    required this.products,
    this.guest = false,
  });

  final List<CatalogProduct> products;
  final bool guest;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: SizedBox(
        height: AppSizes.productSliderHeight,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
          itemCount: products.length,
          separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
          itemBuilder: (_, i) => SizedBox(
            width: AppSizes.productSliderItemWidth,
            child: ProductCard(
              product: products[i],
              showActions: !guest,
              onTap: () => context.push(
                guest ? Routes.signup : Routes.productDetail(products[i].id),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// The "assistant is typing" bubble shown while a reply is in flight.
class AssistantTypingIndicator extends StatelessWidget {
  const AssistantTypingIndicator({super.key});

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

/// Inline error with a retry action, shown at the bottom of the transcript.
class AssistantErrorRow extends StatelessWidget {
  const AssistantErrorRow({super.key, required this.text, required this.onRetry});

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

/// Bottom message-composer. [sending] disables the send button while a reply is
/// in flight; [onSend] is invoked from the button and the keyboard action.
class AssistantInputBar extends StatelessWidget {
  const AssistantInputBar({
    super.key,
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
