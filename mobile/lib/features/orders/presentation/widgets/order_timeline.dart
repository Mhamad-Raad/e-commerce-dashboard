import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../app/theme/app_radii.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/intl_locale.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../domain/order_detail.dart';
import '../../domain/order_status.dart';

/// Canonical fulfilment flow (PAID is a payment state, not a step).
const _steps = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

/// Vertical status stepper for an order. Completed steps show their event
/// timestamp; the current step is highlighted; future steps are dimmed.
/// Cancelled/refunded orders get a terminal banner and no "current" step —
/// only what actually happened stays lit.
class OrderTimeline extends StatelessWidget {
  const OrderTimeline({super.key, required this.order});

  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context).languageCode;
    // PAID sits between PENDING and PROCESSING in the flow.
    final currentIndex =
        order.status == 'PAID' ? 0 : _steps.indexOf(order.status);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (order.isTerminated) ...[
          _TerminalBanner(order: order, locale: locale),
          const SizedBox(height: AppSpacing.md),
        ],
        for (var i = 0; i < _steps.length; i++)
          _Step(
            label: orderStatusLabel(l10n, _steps[i]),
            timestamp: order.statusReachedAt(_steps[i]),
            // Terminated: only steps that actually happened stay lit.
            done: order.isTerminated
                ? order.statusReachedAt(_steps[i]) != null
                : i <= currentIndex,
            current: !order.isTerminated && i == currentIndex,
            isLast: i == _steps.length - 1,
            locale: locale,
          ),
      ],
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({
    required this.label,
    required this.timestamp,
    required this.done,
    required this.current,
    required this.isLast,
    required this.locale,
  });

  final String label;
  final DateTime? timestamp;
  final bool done;
  final bool current;
  final bool isLast;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final accent = done || current ? scheme.primary : scheme.outlineVariant;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Rail: dot + connector to the next step.
          Column(
            children: [
              Icon(
                current
                    ? Icons.radio_button_checked
                    : done
                        ? Icons.check_circle
                        : Icons.circle_outlined,
                size: 20,
                color: accent,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin:
                        const EdgeInsets.symmetric(vertical: AppSpacing.xs),
                    color: done && !current
                        ? scheme.primary
                        : scheme.outlineVariant,
                  ),
                ),
            ],
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: (current ? text.titleSmall : text.bodyMedium)
                        ?.copyWith(
                      color: done || current
                          ? scheme.onSurface
                          : scheme.onSurfaceVariant,
                    ),
                  ),
                  if (timestamp != null)
                    Text(
                      DateFormat.yMMMd(intlLocale(locale))
                          .add_jm()
                          .format(timestamp!),
                      style: text.bodySmall
                          ?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// "Cancelled/refunded" state, with when it happened.
class _TerminalBanner extends StatelessWidget {
  const _TerminalBanner({required this.order, required this.locale});

  final OrderDetail order;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final refunded = order.status == 'REFUNDED';
    final at = order.statusReachedAt(order.status);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: scheme.errorContainer,
        borderRadius: AppRadii.cardRadius,
      ),
      child: Row(
        children: [
          Icon(
            refunded ? Icons.replay_circle_filled_outlined : Icons.cancel_outlined,
            color: scheme.onErrorContainer,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  refunded ? l10n.orderRefundedBanner : l10n.orderCancelledBanner,
                  style: text.titleSmall
                      ?.copyWith(color: scheme.onErrorContainer),
                ),
                if (at != null)
                  Text(
                    DateFormat.yMMMd(intlLocale(locale)).add_jm().format(at),
                    style: text.bodySmall
                        ?.copyWith(color: scheme.onErrorContainer),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
