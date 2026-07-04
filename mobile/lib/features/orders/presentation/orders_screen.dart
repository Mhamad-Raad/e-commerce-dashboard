import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/intl_locale.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/status_views.dart';
import '../data/orders_repository.dart';
import '../domain/order_summary.dart';
import 'widgets/order_status_chip.dart';

/// Order history — the customer's placed orders, newest first. Tapping a row
/// opens its detail. Pushed over the tab shell from Profile.
class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final ordersAsync = ref.watch(ordersListProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.myOrders)),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => ErrorRetry(
          message: l10n.ordersLoadError,
          onRetry: () => ref.invalidate(ordersListProvider),
        ),
        data: (orders) => orders.isEmpty
            ? _Empty()
            : RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(ordersListProvider);
                  await ref.read(ordersListProvider.future);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.margin),
                  itemCount: orders.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.sm),
                  itemBuilder: (_, i) => _OrderRow(order: orders[i]),
                ),
              ),
      ),
    );
  }
}

class _OrderRow extends StatelessWidget {
  const _OrderRow({required this.order});

  final OrderSummary order;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;

    return InkWell(
      borderRadius: AppRadii.cardRadius,
      onTap: () => context.push(Routes.orderDetail(order.id)),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          borderRadius: AppRadii.cardRadius,
          border: Border.all(color: scheme.outlineVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(order.number,
                      style: text.titleSmall, overflow: TextOverflow.ellipsis),
                ),
                OrderStatusChip(status: order.status),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat.yMMMd(intlLocale(locale)).format(order.placedAt),
                  style: text.bodySmall
                      ?.copyWith(color: scheme.onSurfaceVariant),
                ),
                Text(
                    l10n.itemsCount(
                        context.localizedNumber(order.itemCount)),
                    style: text.bodySmall),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              order.total.format(locale: locale),
              style: text.titleMedium?.copyWith(color: scheme.primary),
            ),
          ],
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
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
            Icon(Icons.receipt_long_outlined,
                size: 48, color: scheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.noOrdersYet,
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Text(l10n.ordersHint, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
