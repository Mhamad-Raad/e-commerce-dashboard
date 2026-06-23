import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../domain/placed_order.dart';

/// Checkout step 4 — order placed. Shown via `go()` so the checkout stack is
/// cleared (the cart is now empty). "Continue shopping" returns to Home.
class OrderConfirmationScreen extends StatelessWidget {
  const OrderConfirmationScreen({super.key, required this.order});

  final PlacedOrder order;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    final locale = Localizations.localeOf(context).languageCode;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: scheme.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.check_circle_outline,
                      size: 56, color: scheme.primary),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(l10n.orderPlaced,
                    style: text.headlineSmall, textAlign: TextAlign.center),
                const SizedBox(height: AppSpacing.sm),
                Text(l10n.orderPlacedSubtitle,
                    style: text.bodyMedium, textAlign: TextAlign.center),
                const SizedBox(height: AppSpacing.lg),
                if (order.number.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                    decoration: BoxDecoration(
                      color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
                      borderRadius: AppRadii.pill,
                    ),
                    child: Text('${l10n.orderNumber}: ${order.number}',
                        style: text.titleSmall),
                  ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '${l10n.total}: ${order.total.format(locale: locale)}',
                  style: text.titleMedium
                      ?.copyWith(color: scheme.primary),
                ),
                const SizedBox(height: AppSpacing.xl),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => context.go(Routes.home),
                    child: Text(l10n.continueShopping),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
