import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/money/money.dart';
import '../../../core/network/api_result.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../domain/cart.dart';
import 'providers/cart_controller.dart';

/// The customer's cart: line items with quantity steppers, a coupon, a running
/// subtotal, and a "proceed to checkout" CTA that opens address selection.
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final cartAsync = ref.watch(cartControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.cartTitle)),
      body: cartAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => _CartError(
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (cart) => cart.isEmpty
            ? _CartEmpty(onBrowse: () => context.go(Routes.products))
            : _CartBody(cart: cart),
      ),
    );
  }
}

class _CartBody extends ConsumerWidget {
  const _CartBody({required this.cart});

  final Cart cart;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = Localizations.localeOf(context).languageCode;

    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.margin),
            itemCount: cart.items.length,
            separatorBuilder: (_, _) => const Divider(height: AppSpacing.lg),
            itemBuilder: (_, i) => _CartItemTile(item: cart.items[i]),
          ),
        ),
        _CartSummary(cart: cart, locale: locale),
      ],
    );
  }
}

class _CartItemTile extends ConsumerWidget {
  const _CartItemTile({required this.item});

  final CartItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    final locale = Localizations.localeOf(context).languageCode;
    final notifier = ref.read(cartControllerProvider.notifier);

    Future<void> change(Future<Result<Cart>> future) async {
      final result = await future;
      if (!context.mounted) return;
      if (result case Failed(failure: final f)) {
        showFailure(context, f);
      }
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: AppRadii.fieldRadius,
          child: AppNetworkImage(url: item.imageUrl, width: 64, height: 64),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.name, style: text.titleSmall, maxLines: 2,
                  overflow: TextOverflow.ellipsis),
              if (item.variantName != null && item.variantName!.isNotEmpty)
                Text(item.variantName!,
                    style: text.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant)),
              const SizedBox(height: AppSpacing.xs),
              Text(item.lineTotal.format(locale: locale),
                  style: text.titleSmall?.copyWith(
                      color: Theme.of(context).colorScheme.primary)),
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Column(
          children: [
            _QtyStepper(
              quantity: item.quantity,
              onDecrement: () => change(item.quantity > 1
                  ? notifier.setQuantity(item.id, item.quantity - 1)
                  : notifier.removeItem(item.id)),
              onIncrement: () =>
                  change(notifier.setQuantity(item.id, item.quantity + 1)),
            ),
            IconButton(
              onPressed: () => change(notifier.removeItem(item.id)),
              icon: const Icon(Icons.delete_outline),
              visualDensity: VisualDensity.compact,
            ),
          ],
        ),
      ],
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({
    required this.quantity,
    required this.onDecrement,
    required this.onIncrement,
  });

  final int quantity;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: scheme.outlineVariant),
        borderRadius: AppRadii.pill,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepButton(icon: Icons.remove, onTap: onDecrement),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
            child: Text('$quantity',
                style: Theme.of(context).textTheme.titleSmall),
          ),
          _StepButton(icon: Icons.add, onTap: onIncrement),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: onTap,
      radius: 20,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xs),
        child: Icon(icon, size: 18),
      ),
    );
  }
}

class _CartSummary extends ConsumerStatefulWidget {
  const _CartSummary({required this.cart, required this.locale});

  final Cart cart;
  final String locale;

  @override
  ConsumerState<_CartSummary> createState() => _CartSummaryState();
}

class _CartSummaryState extends ConsumerState<_CartSummary> {
  final _coupon = TextEditingController();
  bool _applying = false;

  @override
  void dispose() {
    _coupon.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon() async {
    if (_applying) return;
    if (_coupon.text.trim().isEmpty) return;
    setState(() => _applying = true);
    final result = await ref
        .read(cartControllerProvider.notifier)
        .applyCoupon(_coupon.text.trim());
    if (!mounted) return;
    setState(() => _applying = false);
    if (result case Failed(failure: final f)) showFailure(context, f);
  }

  Future<void> _removeCoupon() async {
    final result =
        await ref.read(cartControllerProvider.notifier).removeCoupon();
    if (!mounted) return;
    if (result case Failed(failure: final f)) showFailure(context, f);
  }

  @override
  Widget build(BuildContext context) {
    final cart = widget.cart;
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.margin,
        AppSpacing.md,
        AppSpacing.margin,
        AppSpacing.md + MediaQuery.viewPaddingOf(context).bottom,
      ),
      decoration: BoxDecoration(
        color: scheme.surface,
        boxShadow: [
          BoxShadow(
            color: scheme.shadow.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (cart.couponCode == null)
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _coupon,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _applyCoupon(),
                    decoration: InputDecoration(labelText: l10n.couponCode),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                _applying
                    ? const Padding(
                        padding: EdgeInsets.all(AppSpacing.sm),
                        child: SizedBox(
                            width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2)),
                      )
                    : TextButton(
                        onPressed: _applyCoupon, child: Text(l10n.apply)),
              ],
            )
          else
            Row(
              children: [
                Icon(Icons.local_offer_outlined, size: 18, color: scheme.primary),
                const SizedBox(width: AppSpacing.sm),
                Expanded(child: Text(cart.couponCode!, style: text.bodyMedium)),
                TextButton(onPressed: _removeCoupon, child: Text(l10n.remove)),
              ],
            ),
          const SizedBox(height: AppSpacing.sm),
          _SummaryRow(label: l10n.subtotal, value: cart.subtotal, locale: widget.locale),
          if (cart.discountCents > 0)
            _SummaryRow(
              label: l10n.discount,
              value: cart.discount,
              locale: widget.locale,
              negative: true,
            ),
          const SizedBox(height: AppSpacing.xs),
          Text(l10n.taxesFeesAtCheckout,
              style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => context.push(Routes.checkoutAddress),
              child: Text(l10n.proceedToCheckout),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    required this.locale,
    this.negative = false,
  });

  final String label;
  final Money value;
  final String locale;
  final bool negative;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final style = text.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(
            '${negative ? '−' : ''}${value.format(locale: locale)}',
            style: style?.copyWith(
              color: negative ? Theme.of(context).colorScheme.primary : null,
            ),
          ),
        ],
      ),
    );
  }
}

class _CartEmpty extends StatelessWidget {
  const _CartEmpty({required this.onBrowse});

  final VoidCallback onBrowse;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shopping_bag_outlined,
                size: 48, color: scheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.cartEmpty, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onBrowse, child: Text(l10n.startShopping)),
          ],
        ),
      ),
    );
  }
}

class _CartError extends StatelessWidget {
  const _CartError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(context.l10n.cartLoadError),
          const SizedBox(height: AppSpacing.md),
          FilledButton(onPressed: onRetry, child: Text(context.l10n.retry)),
        ],
      ),
    );
  }
}
