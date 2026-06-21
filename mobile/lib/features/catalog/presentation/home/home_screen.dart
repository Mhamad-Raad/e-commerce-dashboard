import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../app/theme/theme_controller.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/widgets/brand_wordmark.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../../../auth/presentation/providers/auth_controller.dart';

/// Placeholder home — confirms the scaffold (theme, app bar, routing, state) runs.
/// Replaced by the real catalog home next.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: const RozhnaAppBar(showCart: true),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const BrandWordmark(),
              const SizedBox(height: AppSpacing.sm),
              Text('Scaffold ready — home goes here', style: text.bodyLarge),
              const SizedBox(height: AppSpacing.xl),
              FilledButton(
                onPressed: () => ref
                    .read(themeControllerProvider.notifier)
                    .toggle(Theme.of(context).brightness),
                child: const Text('Toggle theme'),
              ),
              TextButton(
                onPressed: () => ref.read(authControllerProvider.notifier).logout(),
                child: Text(context.l10n.logOut),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
