import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../domain/home_section_item.dart';

/// Routes a tapped home item to its target. Destinations not built yet show a
/// "coming soon" snackbar so taps still give feedback. As product detail / PLP /
/// store pages land, wire them here — the one place home navigation lives.
void navigateToHomeTarget(BuildContext context, HomeSectionItem item) {
  final target = item.targetType;
  if (target == HomeTargetType.blog) {
    final id = item.blog?.id;
    if (id != null) context.push('${Routes.blog}/$id');
  } else if (target != HomeTargetType.none) {
    // product / category / store / url — not built yet.
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(context.l10n.comingSoon)));
  }
}
