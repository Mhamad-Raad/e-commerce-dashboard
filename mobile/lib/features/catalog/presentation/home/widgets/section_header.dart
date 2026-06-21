import 'package:flutter/material.dart';

import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/l10n/l10n_ext.dart';

/// "Title ........ See all" row above a home section.
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.onSeeAll});

  final String title;
  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.margin,
        AppSpacing.lg,
        AppSpacing.margin,
        AppSpacing.sm,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleLarge,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (onSeeAll != null)
            TextButton(onPressed: onSeeAll, child: Text(context.l10n.seeAll)),
        ],
      ),
    );
  }
}
