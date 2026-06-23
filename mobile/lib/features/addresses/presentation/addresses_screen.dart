import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../../core/widgets/skeleton.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../domain/address.dart';
import 'providers/addresses_controller.dart';

/// Lists the customer's saved delivery addresses with add/edit/delete and a
/// "set default" action. Pushed over the tab shell from Profile.
class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final addressesAsync = ref.watch(addressesControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.myAddresses)),
      floatingActionButton: addressesAsync.maybeWhen(
        data: (list) => list.length >= maxAddresses
            ? null
            : FloatingActionButton.extended(
                onPressed: () => context.push(Routes.addressNew),
                icon: const Icon(Icons.add_location_alt_outlined),
                label: Text(l10n.addAddress),
              ),
        orElse: () => null,
      ),
      body: addressesAsync.when(
        loading: () => const _AddressesSkeleton(),
        error: (_, _) => _AddressesError(
          message: l10n.addressesLoadError,
          onRetry: () => ref.invalidate(addressesControllerProvider),
        ),
        data: (list) => list.isEmpty
            ? _AddressesEmpty(onAdd: () => context.push(Routes.addressNew))
            : RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(addressesControllerProvider);
                  await ref.read(addressesControllerProvider.future);
                },
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.margin),
                  itemCount: list.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (_, i) => _AddressCard(address: list[i]),
                ),
              ),
      ),
    );
  }
}

class _AddressCard extends ConsumerWidget {
  const _AddressCard({required this.address});

  final Address address;

  Future<void> _delete(BuildContext context, WidgetRef ref) async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.deleteAddress),
        content: Text(l10n.deleteAddressConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;

    final result =
        await ref.read(addressesControllerProvider.notifier).delete(address.id);
    if (!context.mounted) return;
    switch (result) {
      case Success():
        showMessage(context, l10n.addressDeleted);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  Future<void> _setDefault(BuildContext context, WidgetRef ref) async {
    final result = await ref
        .read(addressesControllerProvider.notifier)
        .setDefault(address);
    if (!context.mounted) return;
    if (result case Failed(failure: final f)) {
      showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return InkWell(
      borderRadius: AppRadii.cardRadius,
      onTap: () => context.push(Routes.addressEdit(address.id), extra: address),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest.withValues(alpha: 0.4),
          borderRadius: AppRadii.cardRadius,
          border: Border.all(
            color: address.isDefault ? scheme.primary : scheme.outlineVariant,
            width: address.isDefault ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.location_on_outlined, size: 20, color: scheme.primary),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    address.label?.isNotEmpty == true
                        ? address.label!
                        : l10n.addressFallbackLabel,
                    style: text.titleMedium,
                  ),
                ),
                if (address.isDefault)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm, vertical: 2),
                    decoration: BoxDecoration(
                      color: scheme.primary,
                      borderRadius: AppRadii.pill,
                    ),
                    child: Text(
                      l10n.defaultBadge,
                      style: text.labelSmall?.copyWith(color: scheme.onPrimary),
                    ),
                  ),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    switch (value) {
                      case 'default':
                        _setDefault(context, ref);
                      case 'delete':
                        _delete(context, ref);
                    }
                  },
                  itemBuilder: (_) => [
                    if (!address.isDefault)
                      PopupMenuItem(
                        value: 'default',
                        child: Text(l10n.makeDefault),
                      ),
                    PopupMenuItem(value: 'delete', child: Text(l10n.delete)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(address.summary, style: text.bodyMedium),
            if (address.nearestLandmark?.isNotEmpty == true) ...[
              const SizedBox(height: AppSpacing.xs),
              Text(
                address.nearestLandmark!,
                style: text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
              ),
            ],
            if (address.phone?.isNotEmpty == true) ...[
              const SizedBox(height: AppSpacing.xs),
              Row(
                children: [
                  Icon(Icons.phone_outlined,
                      size: 16, color: scheme.onSurfaceVariant),
                  const SizedBox(width: AppSpacing.xs),
                  Text(address.phone!, style: text.bodySmall),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AddressesEmpty extends StatelessWidget {
  const _AddressesEmpty({required this.onAdd});

  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_off_outlined,
                size: 48, color: scheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.noAddressesYet,
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.sm),
            Text(l10n.addAddressHint, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.lg),
            FilledButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add_location_alt_outlined),
              label: Text(l10n.addAddress),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddressesError extends StatelessWidget {
  const _AddressesError({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.margin),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi_off_rounded,
                color: Theme.of(context).colorScheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.md),
            FilledButton(onPressed: onRetry, child: Text(context.l10n.retry)),
          ],
        ),
      ),
    );
  }
}

class _AddressesSkeleton extends StatelessWidget {
  const _AddressesSkeleton();

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView.separated(
        padding: const EdgeInsets.all(AppSpacing.margin),
        itemCount: 3,
        separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
        itemBuilder: (_, _) => const SkeletonBox(height: 96),
      ),
    );
  }
}
