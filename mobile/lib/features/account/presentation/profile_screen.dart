import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/theme_controller.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/rozhna_app_bar.dart';
import '../../auth/presentation/providers/auth_controller.dart';

/// Profile tab — account, orders, addresses, settings (to be built). For now it
/// hosts the dev helpers (theme toggle + logout).
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: const RozhnaAppBar(),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            FilledButton.tonalIcon(
              onPressed: () => ref
                  .read(themeControllerProvider.notifier)
                  .toggle(Theme.of(context).brightness),
              icon: const Icon(Icons.brightness_6_outlined),
              label: Text(l10n.toggleTheme),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton.icon(
              onPressed: () => ref.read(authControllerProvider.notifier).logout(),
              icon: const Icon(Icons.logout),
              label: Text(l10n.logOut),
            ),
          ],
        ),
      ),
    );
  }
}
