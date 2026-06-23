import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/locale/locale_controller.dart';
import '../../../app/router/routes.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../app/theme/theme_controller.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/rozhna_app_bar.dart';
import '../../auth/presentation/providers/auth_controller.dart';

// The three supported languages, by their own autonym.
const _languages = [
  (code: 'en', label: 'English'),
  (code: 'ckb', label: 'کوردی'),
  (code: 'ar', label: 'العربية'),
];

/// Profile tab — account, orders, settings (to be built). For now it hosts the
/// language switcher + dev helpers (theme toggle + logout).
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final current = ref.watch(localeControllerProvider).languageCode;

    return Scaffold(
      appBar: const RozhnaAppBar(),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          Text(l10n.language, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            children: [
              for (final lang in _languages)
                ChoiceChip(
                  label: Text(lang.label),
                  selected: current == lang.code,
                  onSelected: (_) => ref
                      .read(localeControllerProvider.notifier)
                      .set(Locale(lang.code)),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(l10n.account, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppSpacing.sm),
          Card(
            margin: EdgeInsets.zero,
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.favorite_border),
                  title: Text(l10n.myFavorites),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push(Routes.favorites),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.location_on_outlined),
                  title: Text(l10n.myAddresses),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push(Routes.addresses),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
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
    );
  }
}
