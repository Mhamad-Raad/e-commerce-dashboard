import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/money/money.dart';
import '../../../core/network/api_result.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../../addresses/domain/address.dart';
import '../../addresses/presentation/providers/addresses_controller.dart';
import '../domain/cart_quote.dart';
import '../domain/payment_method.dart';
import 'providers/cart_controller.dart';

/// Checkout step 3 — review the order: delivery address, items, an optional
/// note, the payment method, and the live money breakdown, then place the order.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key, required this.addressId});

  final String addressId;

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _notes = TextEditingController();
  String _paymentMethod = paymentOptions.first.code;
  bool _placing = false;

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    // Guard reentrancy directly: the disabled-button check is build-time, so two
    // taps in the same frame both pass it and would create two orders.
    if (_placing) return;
    setState(() => _placing = true);
    final result = await ref.read(cartControllerProvider.notifier).checkout(
          addressId: widget.addressId,
          paymentMethod: _paymentMethod,
          notes: _notes.text.trim(),
        );
    if (!mounted) return;
    setState(() => _placing = false);
    switch (result) {
      case Success(value: final order):
        context.go(Routes.orderConfirmation, extra: order);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context).languageCode;
    final cart = ref.watch(cartControllerProvider).asData?.value;
    final quoteAsync = ref.watch(cartQuoteProvider);
    final address = ref.watch(addressesControllerProvider).asData?.value.firstWhere(
          (a) => a.id == widget.addressId,
          orElse: () => _missingAddress,
        );

    return Scaffold(
      appBar: AppBar(title: Text(l10n.checkout)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          _SectionCard(
            title: l10n.deliveryAddress,
            trailing: TextButton(
              onPressed: () => context.pop(),
              child: Text(l10n.change),
            ),
            child: address == null
                ? Text(l10n.addressFallbackLabel)
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        address.label?.isNotEmpty == true
                            ? address.label!
                            : l10n.addressFallbackLabel,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: 2),
                      Text(address.summary),
                      if (address.phone?.isNotEmpty == true) Text(address.phone!),
                    ],
                  ),
          ),
          const SizedBox(height: AppSpacing.md),
          if (cart != null)
            _SectionCard(
              title: l10n.orderItems,
              child: Column(
                children: [
                  for (final item in cart.items)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Text('${item.quantity}×',
                              style: Theme.of(context).textTheme.bodySmall),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Text(item.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                          ),
                          Text(item.lineTotal.format(locale: locale)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          const SizedBox(height: AppSpacing.md),
          _SectionCard(
            title: l10n.notesOptional,
            child: TextField(
              controller: _notes,
              maxLines: 3,
              decoration: InputDecoration(hintText: l10n.notesHint),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          _SectionCard(
            title: l10n.paymentMethod,
            child: RadioGroup<String>(
              groupValue: _paymentMethod,
              onChanged: (v) => setState(() => _paymentMethod = v!),
              child: Column(
                children: [
                  for (final option in paymentOptions)
                    RadioListTile<String>(
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      value: option.code,
                      secondary: Icon(option.icon),
                      title: Text(option.label(l10n)),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          _SectionCard(
            title: l10n.orderSummary,
            child: quoteAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (_, _) => Text(l10n.cartLoadError),
              data: (quote) => _Breakdown(quote: quote, locale: locale),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _placing ? null : _placeOrder,
              child: _placing
                  ? const SizedBox(
                      width: 22, height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(l10n.placeOrder),
            ),
          ),
        ],
      ),
    );
  }
}

// Sentinel returned when the chosen address can't be found in the list (e.g. it
// was deleted on another device) — keeps the UI null-safe.
final _missingAddress = const Address(
  id: '',
  governorate: '',
  city: '',
);

class _Breakdown extends StatelessWidget {
  const _Breakdown({required this.quote, required this.locale});

  final CartQuote quote;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      children: [
        _row(context, l10n.subtotal, quote.subtotal),
        if (quote.hasDiscount)
          _row(context, l10n.discount, quote.discount, negative: true),
        if (quote.hasTax) _row(context, l10n.tax, quote.tax),
        if (quote.hasFees) _row(context, quote.feesLabel ?? l10n.fees, quote.fees),
        if (quote.hasShipping) _row(context, l10n.shipping, quote.shipping),
        const Divider(),
        _row(context, l10n.total, quote.total, emphasize: true),
      ],
    );
  }

  Widget _row(BuildContext context, String label, Money value,
      {bool negative = false, bool emphasize = false}) {
    final text = Theme.of(context).textTheme;
    final style = emphasize ? text.titleMedium : text.bodyMedium;
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

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.child,
    this.trailing,
  });

  final String title;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        borderRadius: AppRadii.cardRadius,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleSmall),
              ?trailing,
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          child,
        ],
      ),
    );
  }
}
