import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/money/money.dart';
import '../../../core/network/api_result.dart';
import '../../addresses/domain/address.dart';
import '../../addresses/presentation/providers/addresses_controller.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../domain/cart.dart';
import '../domain/cart_quote.dart';
import '../domain/checkout_draft.dart';
import '../domain/payment_method.dart';
import 'providers/cart_controller.dart';
import 'widgets/arrival_chip.dart';
import 'widgets/section_card.dart';

/// Checkout step 3 — review: delivery address (changeable), the selected items
/// grouped per store, payment method (changeable), the live money breakdown,
/// then place the order.
class ReviewOrderScreen extends ConsumerStatefulWidget {
  const ReviewOrderScreen({super.key, required this.draft});

  final CheckoutDraft draft;

  @override
  ConsumerState<ReviewOrderScreen> createState() => _ReviewOrderScreenState();
}

class _ReviewOrderScreenState extends ConsumerState<ReviewOrderScreen> {
  late String _addressId = widget.draft.addressId;
  late String _paymentMethod = widget.draft.paymentMethod;
  bool _placing = false;

  Future<void> _changeAddress() async {
    final id = await context.push<String>(Routes.checkoutAddress);
    if (id != null && mounted) setState(() => _addressId = id);
  }

  Future<void> _changePayment() async {
    final code = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: RadioGroup<String>(
          groupValue: _paymentMethod,
          onChanged: (v) => Navigator.pop(sheetContext, v),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final option in paymentOptions)
                RadioListTile<String>(
                  value: option.code,
                  secondary: Icon(option.icon),
                  title: Text(option.label(sheetContext.l10n)),
                ),
            ],
          ),
        ),
      ),
    );
    if (code != null && mounted) setState(() => _paymentMethod = code);
  }

  Future<void> _placeOrder() async {
    // Guard reentrancy directly: the disabled-button check is build-time, so two
    // taps in the same frame both pass it and would create two orders.
    if (_placing) return;
    setState(() => _placing = true);
    final itemIds = ref.read(cartSelectedIdsProvider);
    final result = await ref.read(cartControllerProvider.notifier).checkout(
          addressId: _addressId,
          paymentMethod: _paymentMethod,
          notes: widget.draft.notes,
          itemIds: itemIds,
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
    final selectedItems = ref.watch(cartSelectedItemsProvider);
    final groups = groupItemsByStore(selectedItems);
    final quoteAsync = ref.watch(cartQuoteProvider);
    final address = ref.watch(addressesControllerProvider).asData?.value.firstWhere(
          (a) => a.id == _addressId,
          orElse: () => _missingAddress,
        );
    final payment =
        paymentOptions.firstWhere((o) => o.code == _paymentMethod);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.reviewOrder)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          SectionCard(
            title: l10n.deliveryAddress,
            trailing: TextButton(
              onPressed: _changeAddress,
              child: Text(l10n.change),
            ),
            child: address == null || address.id.isEmpty
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
                      if (address.phone?.isNotEmpty == true)
                        Text(address.phone!),
                    ],
                  ),
          ),
          const SizedBox(height: AppSpacing.md),
          SectionCard(
            title: l10n.orderItems,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final (g, group) in groups.indexed) ...[
                  if (g > 0) const SizedBox(height: AppSpacing.sm),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          group.storeName,
                          style: Theme.of(context)
                              .textTheme
                              .labelMedium
                              ?.copyWith(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSurfaceVariant),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      ArrivalChip(
                          minDays: group.minLeadDays,
                          maxDays: group.maxLeadDays),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  for (final item in group.items)
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
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SectionCard(
            title: l10n.paymentMethod,
            trailing: TextButton(
              onPressed: _changePayment,
              child: Text(l10n.change),
            ),
            child: Row(
              children: [
                Icon(payment.icon,
                    size: 20,
                    color: Theme.of(context).colorScheme.onSurfaceVariant),
                const SizedBox(width: AppSpacing.sm),
                Text(payment.label(l10n)),
              ],
            ),
          ),
          if (widget.draft.notes.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            SectionCard(
              title: l10n.notes,
              child: Text(widget.draft.notes),
            ),
          ],
          const SizedBox(height: AppSpacing.md),
          SectionCard(
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
              onPressed:
                  _placing || selectedItems.isEmpty ? null : _placeOrder,
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
const _missingAddress = Address(
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
