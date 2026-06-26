import 'package:cached_network_image/cached_network_image.dart';
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

/// Profile tab — an Akkooo-style settings hub: account (orders, wishlist,
/// addresses, profile, password) and preferences (theme, language).
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final customer = ref.watch(authControllerProvider).customer;
    final brightness = Theme.of(context).brightness;
    final currentLang = ref.watch(localeControllerProvider).languageCode;
    final langLabel =
        _languages.firstWhere((l) => l.code == currentLang, orElse: () => _languages.first).label;

    return Scaffold(
      appBar: const RozhnaAppBar(showNotifications: true),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          // Header — avatar + name + phone.
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundImage: (customer?.avatarUrl?.isNotEmpty ?? false)
                    ? CachedNetworkImageProvider(customer!.avatarUrl!)
                    : null,
                child: (customer?.avatarUrl?.isNotEmpty ?? false)
                    ? null
                    : Text(
                        (customer?.name.isNotEmpty ?? false)
                            ? customer!.name[0].toUpperCase()
                            : '?',
                      ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(customer?.name ?? '—',
                        style: Theme.of(context).textTheme.titleMedium),
                    if (customer?.phone != null)
                      Text(customer!.phone!,
                          style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          _SectionLabel(l10n.account),
          _Tile(
            icon: Icons.receipt_long_outlined,
            title: l10n.myOrders,
            onTap: () => context.push(Routes.orders),
          ),
          _Tile(
            icon: Icons.notifications_outlined,
            title: l10n.notifications,
            onTap: () => context.push(Routes.notifications),
          ),
          _Tile(
            icon: Icons.favorite_border,
            title: l10n.myFavorites,
            onTap: () => context.push(Routes.favorites),
          ),
          _Tile(
            icon: Icons.location_on_outlined,
            title: l10n.myAddresses,
            onTap: () => context.push(Routes.addresses),
          ),
          _Tile(
            icon: Icons.person_outline,
            title: l10n.editProfile,
            onTap: () => context.push(Routes.editProfile),
          ),
          _Tile(
            icon: Icons.lock_outline,
            title: l10n.changePassword,
            onTap: () => context.push(Routes.changePassword),
          ),
          const SizedBox(height: AppSpacing.md),

          _SectionLabel(l10n.preferences),
          _Tile(
            icon: Icons.brightness_6_outlined,
            title: l10n.theme,
            trailingText:
                brightness == Brightness.dark ? l10n.themeDark : l10n.themeLight,
            onTap: () =>
                ref.read(themeControllerProvider.notifier).toggle(brightness),
          ),
          _Tile(
            icon: Icons.language_outlined,
            title: l10n.language,
            trailingText: langLabel,
            onTap: () => _pickLanguage(context, ref, currentLang),
          ),
          const SizedBox(height: AppSpacing.xl),

          TextButton.icon(
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
            label: Text(l10n.logOut),
          ),
        ],
      ),
    );
  }

  Future<void> _pickLanguage(
      BuildContext context, WidgetRef ref, String current) async {
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final lang in _languages)
              ListTile(
                title: Text(lang.label),
                trailing: current == lang.code
                    ? Icon(Icons.check,
                        color: Theme.of(ctx).colorScheme.primary)
                    : null,
                onTap: () {
                  ref
                      .read(localeControllerProvider.notifier)
                      .set(Locale(lang.code));
                  Navigator.pop(ctx);
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs, top: AppSpacing.xs),
      child: Text(
        label.toUpperCase(),
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              letterSpacing: 0.8,
            ),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.trailingText,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final String? trailingText;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: scheme.primary),
      title: Text(title),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailingText != null)
            Text(trailingText!,
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: scheme.onSurfaceVariant)),
          const Icon(Icons.chevron_right),
        ],
      ),
      onTap: onTap,
    );
  }
}
