import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../core/l10n/l10n_ext.dart';

/// The in-app route for an announcement/notification target, or null when the
/// target isn't deep-linkable yet (category / external URL / none). Shared by
/// the in-app row tap and the push-notification tap so both behave identically.
String? notificationTargetRoute(
  String? targetType,
  String? targetId,
  String? url,
) {
  switch (targetType) {
    case 'PRODUCT':
      return (targetId != null && targetId.isNotEmpty)
          ? Routes.productDetail(targetId)
          : null;
    case 'STORE':
      return (targetId != null && targetId.isNotEmpty)
          ? Routes.storeDetail(targetId)
          : null;
    case 'BLOG':
      return (targetId != null && targetId.isNotEmpty)
          ? '${Routes.blog}/$targetId'
          : null;
    default:
      // CATEGORY / URL / NONE are not deep-linked yet (same gap as home items).
      return null;
  }
}

/// Navigate to a notification target with UI feedback. Falls back to a
/// "coming soon" snackbar for targets that exist but aren't wired yet.
void openNotificationTarget(
  BuildContext context,
  String? targetType,
  String? targetId,
  String? url,
) {
  final route = notificationTargetRoute(targetType, targetId, url);
  if (route != null) {
    context.push(route);
  } else if (targetType != null && targetType != 'NONE') {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(context.l10n.comingSoon)));
  }
}
