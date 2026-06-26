import 'package:flutter/material.dart';

import '../../../app/router/routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../orders/domain/order_status.dart';
import '../domain/app_notification.dart';

/// Client-side rendering of a notification's text/icon/destination from its
/// type + data, in the app's CURRENT language. The backend stores no text, so
/// the same stored row reads correctly in EN/AR/CKB.

String notificationTitle(AppLocalizations l10n, AppNotification n) =>
    switch (n.type) {
      'ORDER_PLACED' => l10n.notifOrderPlacedTitle,
      'ORDER_STATUS_CHANGED' => l10n.notifOrderUpdateTitle,
      // Announcement title is authored + server-resolved to the app language.
      'ANNOUNCEMENT' => n.announcement?.title ?? l10n.notifications,
      _ => l10n.notifications,
    };

String notificationBody(AppLocalizations l10n, AppNotification n) {
  final number = n.data['number'] as String? ?? '';
  switch (n.type) {
    case 'ORDER_PLACED':
      return l10n.notifOrderPlacedBody(number);
    case 'ORDER_STATUS_CHANGED':
      final status = n.data['status'] as String? ?? '';
      return l10n.notifOrderStatusBody(number, orderStatusLabel(l10n, status));
    case 'ANNOUNCEMENT':
      return n.announcement?.body ?? '';
    default:
      return '';
  }
}

IconData notificationIcon(AppNotification n) => switch (n.type) {
  'ORDER_PLACED' => Icons.shopping_bag_outlined,
  'ORDER_STATUS_CHANGED' => Icons.local_shipping_outlined,
  'ANNOUNCEMENT' => Icons.campaign_outlined,
  _ => Icons.notifications_outlined,
};

/// Where tapping the notification should navigate, or null if it has no target.
String? notificationRoute(AppNotification n) {
  final orderId = n.orderId;
  if (orderId != null && orderId.isNotEmpty) return Routes.orderDetail(orderId);
  return null;
}
