import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

/// Localized label for an [OrderStatus] enum value from the API.
String orderStatusLabel(AppLocalizations l10n, String status) => switch (status) {
      'PENDING' => l10n.orderStatusPending,
      'PAID' => l10n.orderStatusPaid,
      'PROCESSING' => l10n.orderStatusProcessing,
      'SHIPPED' => l10n.orderStatusShipped,
      'OUT_FOR_DELIVERY' => l10n.orderStatusOutForDelivery,
      'DELIVERED' => l10n.orderStatusDelivered,
      'CANCELLED' => l10n.orderStatusCancelled,
      'REFUNDED' => l10n.orderStatusRefunded,
      _ => status,
    };

/// A status accent colour, drawn from the theme so it adapts to light/dark.
Color orderStatusColor(ColorScheme scheme, String status) => switch (status) {
      'DELIVERED' || 'PAID' => Colors.green,
      'CANCELLED' || 'REFUNDED' => scheme.error,
      'SHIPPED' || 'OUT_FOR_DELIVERY' => scheme.tertiary,
      _ => scheme.primary, // PENDING / PROCESSING
    };

/// Localized label for a [PaymentStatus] enum value.
String paymentStatusLabel(AppLocalizations l10n, String status) =>
    switch (status) {
      'PENDING' => l10n.payStatusPending,
      'PAID' => l10n.payStatusPaid,
      'FAILED' => l10n.payStatusFailed,
      'REFUNDED' => l10n.payStatusRefunded,
      _ => status,
    };
