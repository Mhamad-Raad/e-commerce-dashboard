import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/router/routes.dart';
import '../../../core/l10n/l10n_ext.dart';

/// The in-app route for an announcement/notification target, or null when the
/// target opens externally (URL) or has none. Shared by the in-app row tap and
/// the push-notification tap so both behave identically.
String? notificationTargetRoute(
  String? targetType,
  String? targetId,
  String? url,
) {
  bool hasId() => targetId != null && targetId.isNotEmpty;
  switch (targetType) {
    case 'PRODUCT':
      return hasId() ? Routes.productDetail(targetId!) : null;
    case 'STORE':
      return hasId() ? Routes.storeDetail(targetId!) : null;
    case 'BLOG':
      return hasId() ? '${Routes.blog}/$targetId' : null;
    case 'CATEGORY':
      return hasId() ? Routes.categoryProducts(targetId!) : null;
    default:
      // URL opens externally (not an in-app route); NONE has no destination.
      return null;
  }
}

/// Navigate to a notification target with UI feedback. In-app targets push their
/// route; URL targets open externally. Anything else falls back to a snackbar.
Future<void> openNotificationTarget(
  BuildContext context,
  String? targetType,
  String? targetId,
  String? url,
) async {
  final route = notificationTargetRoute(targetType, targetId, url);
  if (route != null) {
    context.push(route);
    return;
  }
  if (targetType == 'URL') {
    final messenger = ScaffoldMessenger.of(context);
    final errorText = context.l10n.linkOpenError;
    final uri =
        (url == null || url.trim().isEmpty) ? null : Uri.tryParse(url.trim());
    // launchUrl can throw (not just return false) on a bad URL — guard it.
    var opened = false;
    if (uri != null) {
      try {
        opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      } catch (_) {
        opened = false;
      }
    }
    if (!opened) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(errorText)));
    }
    return;
  }
  if (targetType != null && targetType != 'NONE') {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(context.l10n.comingSoon)));
  }
}
