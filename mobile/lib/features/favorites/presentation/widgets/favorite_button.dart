import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/network/api_result.dart';
import '../../../auth/presentation/widgets/auth_widgets.dart';
import '../providers/favorites_providers.dart';

/// Heart toggle backed by [favoriteIdsProvider]. [compact] renders a small
/// circular button for overlaying on product cards; otherwise a plain
/// [IconButton] for app bars.
class FavoriteButton extends ConsumerWidget {
  const FavoriteButton({super.key, required this.productId, this.compact = false});

  final String productId;
  final bool compact;

  Future<void> _toggle(BuildContext context, WidgetRef ref, bool wasFav) async {
    final result =
        await ref.read(favoriteIdsProvider.notifier).toggle(productId);
    if (!context.mounted) return;
    switch (result) {
      case Success():
        showMessage(
          context,
          wasFav ? context.l10n.removedFromFavorites : context.l10n.addedToFavorites,
        );
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFav = ref.watch(favoriteIdsProvider).contains(productId);
    final scheme = Theme.of(context).colorScheme;
    final icon = isFav ? Icons.favorite : Icons.favorite_border;
    final color = isFav ? scheme.primary : null;

    if (!compact) {
      return IconButton(
        onPressed: () => _toggle(context, ref, isFav),
        icon: Icon(icon, color: color),
      );
    }
    return Material(
      color: scheme.surface.withValues(alpha: 0.9),
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _toggle(context, ref, isFav),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xs),
          child: Icon(icon, size: 18, color: color ?? scheme.onSurfaceVariant),
        ),
      ),
    );
  }
}
