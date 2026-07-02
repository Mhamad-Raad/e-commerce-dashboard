import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../addresses/domain/address.dart';
import '../../addresses/presentation/providers/addresses_controller.dart';

/// Address picker for checkout — pushed with `context.push<String>(...)`; pops
/// with the chosen address id (default pre-selected), or lets the user add one
/// when none exist.
class SelectAddressScreen extends ConsumerStatefulWidget {
  const SelectAddressScreen({super.key});

  @override
  ConsumerState<SelectAddressScreen> createState() =>
      _SelectAddressScreenState();
}

class _SelectAddressScreenState extends ConsumerState<SelectAddressScreen> {
  String? _selectedId;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final addressesAsync = ref.watch(addressesControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.selectAddress)),
      body: addressesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.addressesLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(addressesControllerProvider),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (list) =>
            list.isEmpty ? _noAddresses(context) : _addressList(context, list),
      ),
    );
  }

  Widget _noAddresses(BuildContext context) {
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
            Text(l10n.noAddressForCheckout, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.lg),
            FilledButton.icon(
              onPressed: () => context.push(Routes.addressNew),
              icon: const Icon(Icons.add_location_alt_outlined),
              label: Text(l10n.addAddress),
            ),
          ],
        ),
      ),
    );
  }

  Widget _addressList(BuildContext context, List<Address> list) {
    final l10n = context.l10n;
    // Default selection: previously tapped, else the default address, else first.
    final selectedId = _selectedId ??
        list.firstWhere((a) => a.isDefault, orElse: () => list.first).id;

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.margin),
            children: [
              for (final a in list)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: _AddressRadioTile(
                    address: a,
                    selected: a.id == selectedId,
                    onTap: () => setState(() => _selectedId = a.id),
                  ),
                ),
              TextButton.icon(
                onPressed: () => context.push(Routes.addressNew),
                icon: const Icon(Icons.add),
                label: Text(l10n.addAnotherAddress),
              ),
            ],
          ),
        ),
        SafeArea(
          minimum: const EdgeInsets.all(AppSpacing.margin),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => context.pop(selectedId),
              child: Text(l10n.useThisAddress),
            ),
          ),
        ),
      ],
    );
  }
}

class _AddressRadioTile extends StatelessWidget {
  const _AddressRadioTile({
    required this.address,
    required this.selected,
    required this.onTap,
  });

  final Address address;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return InkWell(
      borderRadius: AppRadii.cardRadius,
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          borderRadius: AppRadii.cardRadius,
          border: Border.all(
            color: selected ? scheme.primary : scheme.outlineVariant,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? scheme.primary : scheme.onSurfaceVariant,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          address.label?.isNotEmpty == true
                              ? address.label!
                              : l10n.addressFallbackLabel,
                          style: text.titleSmall,
                        ),
                      ),
                      if (address.isDefault)
                        Text(l10n.defaultBadge,
                            style: text.labelSmall
                                ?.copyWith(color: scheme.primary)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(address.summary, style: text.bodySmall),
                  if (address.phone?.isNotEmpty == true)
                    Text(address.phone!,
                        style: text.bodySmall
                            ?.copyWith(color: scheme.onSurfaceVariant)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
