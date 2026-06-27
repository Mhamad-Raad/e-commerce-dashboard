import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../app/router/routes.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../domain/home_section_item.dart';

/// Routes a tapped home item to its target. Every target type is wired:
/// product/store/blog open their detail pages, category opens a filtered product
/// list, and URL opens externally. This is the one place home navigation lives.
Future<void> navigateToHomeTarget(
  BuildContext context,
  HomeSectionItem item,
) async {
  final target = item.targetType;
  if (target == HomeTargetType.blog) {
    final id = item.blog?.id;
    if (id != null) context.push('${Routes.blog}/$id');
  } else if (target == HomeTargetType.product) {
    final id = item.product?.id;
    if (id != null) context.push(Routes.productDetail(id));
  } else if (target == HomeTargetType.store) {
    final id = item.store?.id;
    if (id != null) context.push(Routes.storeDetail(id));
  } else if (target == HomeTargetType.category) {
    final category = item.category;
    if (category != null) {
      context.push(Routes.categoryProducts(category.id), extra: category.name);
    }
  } else if (target == HomeTargetType.url) {
    await _openExternalUrl(context, item.url);
  }
}

/// Opens an external URL in the browser. Shows a snackbar if it can't be opened.
/// `launchUrl` can throw (not just return false) on an unsupported/malformed
/// URL, so guard it — a bad admin-entered URL must not crash the tap.
Future<void> _openExternalUrl(BuildContext context, String? raw) async {
  final messenger = ScaffoldMessenger.of(context);
  final errorText = context.l10n.linkOpenError;
  final uri = (raw == null || raw.trim().isEmpty) ? null : Uri.tryParse(raw.trim());
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
}
