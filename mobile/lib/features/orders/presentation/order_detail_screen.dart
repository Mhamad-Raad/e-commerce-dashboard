import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/money/money.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../cart/domain/payment_method.dart';
import '../data/orders_repository.dart';
import '../domain/order_detail.dart';
import '../domain/order_status.dart';
import 'widgets/order_status_chip.dart';

/// Full detail of one order: status + tracking, items, money breakdown, delivery
/// address, payment, and any note left at checkout.
class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final detailAsync = ref.watch(orderDetailProvider(id));

    return Scaffold(
      appBar: AppBar(title: Text(l10n.orderDetailTitle)),
      body: detailAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.orderLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(orderDetailProvider(id)),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (order) => _Body(order: order),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.order});

  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.margin),
      children: [
        // Header: number + date + status.
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(order.number, style: text.titleMedium),
                  const SizedBox(height: 2),
                  Text(
                    DateFormat.yMMMd(locale).add_jm().format(order.placedAt),
                    style: text.bodySmall
                        ?.copyWith(color: scheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
            OrderStatusChip(status: order.status),
          ],
        ),
        if (order.trackingNumber != null &&
            order.trackingNumber!.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Icon(Icons.local_shipping_outlined,
                  size: 18, color: scheme.onSurfaceVariant),
              const SizedBox(width: AppSpacing.sm),
              Text('${l10n.trackingNumber}: ${order.trackingNumber}',
                  style: text.bodyMedium),
            ],
          ),
        ],
        const SizedBox(height: AppSpacing.md),

        _Section(
          title: l10n.orderItems,
          child: Column(
            children: [
              for (final item in order.items)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
                  child: _ItemRow(item: item, locale: locale),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        _Section(
          title: l10n.orderSummary,
          child: Column(
            children: [
              _row(context, l10n.subtotal, order.subtotal, locale),
              if (order.hasDiscount)
                _row(context, l10n.discount, order.discount, locale,
                    negative: true),
              if (order.hasTax) _row(context, l10n.tax, order.tax, locale),
              if (order.hasFees)
                _row(context, order.feesLabel ?? l10n.fees, order.fees, locale),
              if (order.hasShipping)
                _row(context, l10n.shipping, order.shipping, locale),
              const Divider(),
              _row(context, l10n.total, order.total, locale, emphasize: true),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        if (order.ship.hasAddress)
          _Section(
            title: l10n.deliveryAddress,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (order.ship.name != null && order.ship.name!.isNotEmpty)
                  Text(order.ship.name!, style: text.titleSmall),
                Text(order.ship.summary),
                if (order.ship.landmark != null &&
                    order.ship.landmark!.isNotEmpty)
                  Text(order.ship.landmark!,
                      style: text.bodySmall
                          ?.copyWith(color: scheme.onSurfaceVariant)),
                if (order.ship.phone != null && order.ship.phone!.isNotEmpty)
                  Text(order.ship.phone!,
                      style: text.bodySmall
                          ?.copyWith(color: scheme.onSurfaceVariant)),
              ],
            ),
          ),
        if (order.ship.hasAddress) const SizedBox(height: AppSpacing.md),

        _Section(
          title: l10n.paymentMethod,
          child: order.payments.isEmpty
              ? Text(l10n.payStatusPending)
              : Column(
                  children: [
                    for (final p in order.payments)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(_paymentLabel(context, p.method)),
                          Text(paymentStatusLabel(l10n, p.status),
                              style: text.bodySmall),
                        ],
                      ),
                  ],
                ),
        ),

        if (order.notes != null && order.notes!.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          _Section(title: l10n.notes, child: Text(order.notes!)),
        ],
      ],
    );
  }

  String _paymentLabel(BuildContext context, String code) {
    final option = paymentOptions.where((o) => o.code == code);
    return option.isEmpty ? code : option.first.label(context.l10n);
  }

  Widget _row(BuildContext context, String label, Money value, String locale,
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

class _ItemRow extends StatelessWidget {
  const _ItemRow({required this.item, required this.locale});

  final OrderLineItem item;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: AppRadii.fieldRadius,
          child: AppNetworkImage(url: item.imageUrl, width: 48, height: 48),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.name,
                  style: text.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
              if (item.variantName != null && item.variantName!.isNotEmpty)
                Text(item.variantName!,
                    style: text.bodySmall
                        ?.copyWith(color: scheme.onSurfaceVariant)),
              Text('×${item.quantity}',
                  style: text.bodySmall
                      ?.copyWith(color: scheme.onSurfaceVariant)),
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Text(item.lineTotal.format(locale: locale), style: text.bodyMedium),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});

  final String title;
  final Widget child;

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
          Text(title, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          child,
        ],
      ),
    );
  }
}
