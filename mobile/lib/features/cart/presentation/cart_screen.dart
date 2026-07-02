import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/money/money.dart';
import '../../../core/network/api_result.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/skeleton.dart';
import '../../addresses/domain/address.dart';
import '../../addresses/presentation/providers/addresses_controller.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../domain/cart.dart';
import 'providers/cart_controller.dart';
import 'widgets/arrival_chip.dart';

/// The customer's cart, grouped per store with arrival estimates. Items are all
/// selected by default; the user can narrow the selection (checkboxes are local
/// state — see §selection in the cart controller). Checkout proceeds with the
/// selected items only.
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final cartAsync = ref.watch(cartControllerProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.cartTitle)),
      body: cartAsync.when(
        loading: () => const _CartSkeleton(),
        error: (_, _) => _CartError(
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (_) {
          final items = ref.watch(cartVisibleItemsProvider);
          return items.isEmpty
              ? _CartEmpty(onBrowse: () => context.go(Routes.products))
              : _CartBody(items: items);
        },
      ),
    );
  }
}

class _CartBody extends ConsumerWidget {
  const _CartBody({required this.items});

  final List<CartItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groups = groupItemsByStore(items);

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.margin),
            children: [
              _SelectAllRow(items: items, groups: groups),
              const SizedBox(height: AppSpacing.sm),
              for (final group in groups)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.gutter),
                  child: _StoreGroupCard(group: group),
                ),
            ],
          ),
        ),
        _CartSummary(items: items),
      ],
    );
  }
}

/// true = all selected, false = none, null = mixed (drives tristate checkboxes).
bool? _tristate(Iterable<CartItem> items, Set<String> deselected) {
  var selected = 0, total = 0;
  for (final i in items) {
    total++;
    if (!deselected.contains(i.id)) selected++;
  }
  if (selected == total) return true;
  if (selected == 0) return false;
  return null;
}

class _RoundCheckbox extends StatelessWidget {
  const _RoundCheckbox({required this.value, required this.onChanged});

  final bool? value;
  final ValueChanged<bool?> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 32,
      height: 32,
      child: Checkbox(
        value: value,
        tristate: true,
        onChanged: onChanged,
        shape: const CircleBorder(),
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}

class _SelectAllRow extends ConsumerWidget {
  const _SelectAllRow({required this.items, required this.groups});

  final List<CartItem> items;
  final List<CartStoreGroup> groups;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deselected = ref.watch(cartDeselectedProvider);
    final state = _tristate(items, deselected);
    final minDays = groups.fold(groups.first.minLeadDays,
        (m, g) => g.minLeadDays < m ? g.minLeadDays : m);
    final maxDays = groups.fold(groups.first.maxLeadDays,
        (m, g) => g.maxLeadDays > m ? g.maxLeadDays : m);

    return Row(
      children: [
        _RoundCheckbox(
          value: state,
          onChanged: (_) {
            final notifier = ref.read(cartDeselectedProvider.notifier);
            // Anything but "all selected" -> select all; otherwise deselect all.
            state == true
                ? notifier.addAll(items.map((i) => i.id))
                : notifier.clear();
          },
        ),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: Text(context.l10n.selectAll,
              style: Theme.of(context).textTheme.titleSmall),
        ),
        ArrivalChip(minDays: minDays, maxDays: maxDays),
      ],
    );
  }
}

class _StoreGroupCard extends ConsumerWidget {
  const _StoreGroupCard({required this.group});

  final CartStoreGroup group;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scheme = Theme.of(context).colorScheme;
    final deselected = ref.watch(cartDeselectedProvider);
    final state = _tristate(group.items, deselected);

    return Container(
      // Clipped so the swipe-to-delete background respects the rounded corners.
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: AppRadii.cardRadius,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.sm, AppSpacing.sm, AppSpacing.md, 0),
            child: Row(
              children: [
                _RoundCheckbox(
                  value: state,
                  onChanged: (_) {
                    final notifier = ref.read(cartDeselectedProvider.notifier);
                    final ids = group.items.map((i) => i.id);
                    state == true ? notifier.addAll(ids) : notifier.removeAll(ids);
                  },
                ),
                const SizedBox(width: AppSpacing.xs),
                Expanded(
                  child: Text(
                    group.storeName,
                    style: Theme.of(context).textTheme.titleSmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                ArrivalChip(
                    minDays: group.minLeadDays, maxDays: group.maxLeadDays),
              ],
            ),
          ),
          for (final (i, item) in group.items.indexed) ...[
            if (i > 0)
              const Divider(
                  height: 1, indent: AppSpacing.md, endIndent: AppSpacing.md),
            _CartItemRow(item: item),
          ],
          const SizedBox(height: AppSpacing.xs),
        ],
      ),
    );
  }
}

class _CartItemRow extends ConsumerWidget {
  const _CartItemRow({required this.item});

  final CartItem item;

  Future<void> _remove(BuildContext context, WidgetRef ref) async {
    final result =
        await ref.read(cartControllerProvider.notifier).removeItem(item.id);
    if (!context.mounted) return;
    if (result case Failed(failure: final f)) showFailure(context, f);
  }

  Future<void> _confirmRemove(BuildContext context, WidgetRef ref) async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.removeFromCart),
        content: Text(l10n.removeFromCartMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(l10n.remove),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) await _remove(context, ref);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;
    final notifier = ref.read(cartControllerProvider.notifier);
    final busy = ref.watch(cartItemBusyProvider).contains(item.id);
    final selected = !ref.watch(cartDeselectedProvider).contains(item.id);

    Future<void> setQty(int quantity) async {
      final result = await notifier.setQuantity(item.id, quantity);
      if (!context.mounted) return;
      if (result case Failed(failure: final f)) showFailure(context, f);
    }

    return Dismissible(
      key: ValueKey(item.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: scheme.errorContainer,
        alignment: AlignmentDirectional.centerEnd,
        padding: const EdgeInsetsDirectional.only(end: AppSpacing.lg),
        child: Icon(Icons.delete_outline, color: scheme.onErrorContainer),
      ),
      onDismissed: (_) => _remove(context, ref),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
            AppSpacing.sm, AppSpacing.sm, AppSpacing.md, AppSpacing.sm),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: () =>
                  ref.read(cartDeselectedProvider.notifier).toggle(item.id),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xs),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  transitionBuilder: (child, animation) =>
                      ScaleTransition(scale: animation, child: child),
                  child: Icon(
                    selected
                        ? Icons.check_circle
                        : Icons.radio_button_unchecked,
                    key: ValueKey(selected),
                    size: 22,
                    color: selected ? scheme.primary : scheme.outline,
                  ),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.xs),
            ClipRRect(
              borderRadius: AppRadii.fieldRadius,
              child: AppNetworkImage(url: item.imageUrl, width: 64, height: 64),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.name, style: text.titleSmall, maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  if (item.variantName != null && item.variantName!.isNotEmpty)
                    Text(item.variantName!,
                        style: text.bodySmall
                            ?.copyWith(color: scheme.onSurfaceVariant)),
                  const SizedBox(height: AppSpacing.xs),
                  Text(item.lineTotal.format(locale: locale),
                      style:
                          text.titleSmall?.copyWith(color: scheme.primary)),
                  if (item.quantity > 1)
                    Text(item.unitPrice.format(locale: locale),
                        style: text.labelSmall
                            ?.copyWith(color: scheme.onSurfaceVariant)),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            _QtyStepper(
              quantity: item.quantity,
              busy: busy,
              onDecrement: () => item.quantity > 1
                  ? setQty(item.quantity - 1)
                  : _confirmRemove(context, ref),
              onIncrement: () => setQty(item.quantity + 1),
            ),
          ],
        ),
      ),
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({
    required this.quantity,
    required this.busy,
    required this.onDecrement,
    required this.onIncrement,
  });

  final int quantity;
  final bool busy;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: scheme.outlineVariant),
        borderRadius: AppRadii.pill,
      ),
      // Controls hide (not shrink) while the mutation round-trips, so the pill
      // keeps its size and rapid taps are serialised.
      child: Stack(
        alignment: Alignment.center,
        children: [
          IgnorePointer(
            ignoring: busy,
            child: Opacity(
              opacity: busy ? 0 : 1,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _StepButton(icon: Icons.remove, onTap: onDecrement),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm),
                    child: Text('$quantity',
                        style: Theme.of(context).textTheme.titleSmall),
                  ),
                  _StepButton(icon: Icons.add, onTap: onIncrement),
                ],
              ),
            ),
          ),
          if (busy)
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: onTap,
      radius: 20,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xs),
        child: Icon(icon, size: 18),
      ),
    );
  }
}

class _CartSummary extends ConsumerStatefulWidget {
  const _CartSummary({required this.items});

  final List<CartItem> items;

  @override
  ConsumerState<_CartSummary> createState() => _CartSummaryState();
}

class _CartSummaryState extends ConsumerState<_CartSummary> {
  bool _proceeding = false;

  /// Akkooo-style address gating: no addresses -> create one; no default ->
  /// pick one; otherwise carry the default straight to the payment step.
  Future<void> _proceed() async {
    if (_proceeding) return;
    setState(() => _proceeding = true);
    try {
      final addresses = await ref.read(addressesControllerProvider.future);
      if (!mounted) return;
      if (addresses.isEmpty) {
        context.push(Routes.addressNew);
        return;
      }
      Address? defaultAddress;
      for (final a in addresses) {
        if (a.isDefault) {
          defaultAddress = a;
          break;
        }
      }
      var addressId = defaultAddress?.id;
      addressId ??= await context.push<String>(Routes.checkoutAddress);
      if (addressId == null || !mounted) return;
      context.push(Routes.checkoutOptions, extra: addressId);
    } catch (_) {
      if (mounted) showMessage(context, context.l10n.addressesLoadError);
    } finally {
      if (mounted) setState(() => _proceeding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;
    final selected = ref.watch(cartSelectedItemsProvider);
    final subtotalCents =
        selected.fold(0, (sum, i) => sum + i.priceCents * i.quantity);

    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.margin,
        AppSpacing.md,
        AppSpacing.margin,
        AppSpacing.md + MediaQuery.viewPaddingOf(context).bottom,
      ),
      decoration: BoxDecoration(
        color: scheme.surface,
        boxShadow: [
          BoxShadow(
            color: scheme.shadow.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(l10n.subtotal, style: text.bodyMedium),
              Text(Money(subtotalCents).format(locale: locale),
                  style: text.titleMedium),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.selectedItemsCount(
                    context.localizedNumber(selected.length),
                    context.localizedNumber(widget.items.length)),
                style:
                    text.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
              ),
              Text(l10n.taxesFeesAtCheckout,
                  style: text.bodySmall
                      ?.copyWith(color: scheme.onSurfaceVariant)),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed:
                  selected.isEmpty || _proceeding ? null : _proceed,
              child: _proceeding
                  ? const SizedBox(
                      width: 22, height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(l10n.proceedToCheckout),
            ),
          ),
        ],
      ),
    );
  }
}

class _CartSkeleton extends StatelessWidget {
  const _CartSkeleton();

  @override
  Widget build(BuildContext context) {
    Widget itemRow() => Padding(
          padding: const EdgeInsets.all(AppSpacing.sm),
          child: Row(
            children: [
              const SkeletonBox(width: 22, height: 22, shape: BoxShape.circle),
              const SizedBox(width: AppSpacing.sm),
              const SkeletonBox(width: 64, height: 64),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    SkeletonBox(height: 14, width: double.infinity),
                    SizedBox(height: AppSpacing.sm),
                    SkeletonBox(height: 14, width: 120),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              const SkeletonBox(width: 84, height: 32),
            ],
          ),
        );

    Widget groupCard() => Container(
          margin: const EdgeInsets.only(bottom: AppSpacing.gutter),
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            borderRadius: AppRadii.cardRadius,
            border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant),
          ),
          child: Column(
            children: [
              Row(
                children: const [
                  SkeletonBox(width: 22, height: 22, shape: BoxShape.circle),
                  SizedBox(width: AppSpacing.sm),
                  SkeletonBox(height: 14, width: 110),
                  Spacer(),
                  SkeletonBox(height: 20, width: 100),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              itemRow(),
              itemRow(),
            ],
          ),
        );

    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          Row(
            children: const [
              SkeletonBox(width: 22, height: 22, shape: BoxShape.circle),
              SizedBox(width: AppSpacing.sm),
              SkeletonBox(height: 14, width: 40),
              Spacer(),
              SkeletonBox(height: 20, width: 110),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          groupCard(),
          groupCard(),
        ],
      ),
    );
  }
}

class _CartEmpty extends StatelessWidget {
  const _CartEmpty({required this.onBrowse});

  final VoidCallback onBrowse;

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
            Icon(Icons.shopping_bag_outlined,
                size: 48, color: scheme.onSurfaceVariant),
            const SizedBox(height: AppSpacing.md),
            Text(l10n.cartEmpty, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onBrowse, child: Text(l10n.startShopping)),
          ],
        ),
      ),
    );
  }
}

class _CartError extends StatelessWidget {
  const _CartError({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(context.l10n.cartLoadError),
          const SizedBox(height: AppSpacing.md),
          FilledButton(onPressed: onRetry, child: Text(context.l10n.retry)),
        ],
      ),
    );
  }
}
