import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_radii.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/money/money.dart';
import '../../../../core/widgets/app_network_image.dart';

/// Slide-up confirmation after adding to the cart: what was added + qty/price,
/// then keep shopping or jump to the cart.
Future<void> showAddedToCartSheet(
  BuildContext context, {
  required String name,
  required int quantity,
  required Money lineTotal,
  String? imageUrl,
  String? variantName,
}) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (ctx) => _AddedToCartSheet(
      name: name,
      quantity: quantity,
      lineTotal: lineTotal,
      imageUrl: imageUrl,
      variantName: variantName,
    ),
  );
}

class _AddedToCartSheet extends StatelessWidget {
  const _AddedToCartSheet({
    required this.name,
    required this.quantity,
    required this.lineTotal,
    this.imageUrl,
    this.variantName,
  });

  final String name;
  final int quantity;
  final Money lineTotal;
  final String? imageUrl;
  final String? variantName;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.margin,
          0,
          AppSpacing.margin,
          AppSpacing.md,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.check_circle, color: scheme.primary),
                const SizedBox(width: AppSpacing.sm),
                Text(l10n.addedToCart, style: text.titleMedium),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: AppRadii.fieldRadius,
                  child:
                      AppNetworkImage(url: imageUrl, width: 64, height: 64),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name,
                          style: text.bodyLarge,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis),
                      if (variantName != null && variantName!.isNotEmpty)
                        Text(variantName!,
                            style: text.bodySmall
                                ?.copyWith(color: scheme.onSurfaceVariant)),
                      const SizedBox(height: AppSpacing.xs),
                      Row(
                        children: [
                          Text('×${context.localizedNumber(quantity)}',
                              style: text.bodySmall?.copyWith(
                                  color: scheme.onSurfaceVariant)),
                          const Spacer(),
                          Text(
                            lineTotal.format(locale: locale),
                            style: text.titleSmall
                                ?.copyWith(color: scheme.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(l10n.continueShopping),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      context.push(Routes.cart);
                    },
                    child: Text(l10n.goToCart),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
