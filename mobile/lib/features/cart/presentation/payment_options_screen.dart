import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../domain/checkout_draft.dart';
import '../domain/payment_method.dart';
import 'providers/cart_controller.dart';

/// Checkout step 2 — payment method, coupon, and order notes (the coupon lives
/// here, not on the cart, mirroring the reference flow). Continues to review.
class PaymentOptionsScreen extends ConsumerStatefulWidget {
  const PaymentOptionsScreen({super.key, required this.addressId});

  final String addressId;

  @override
  ConsumerState<PaymentOptionsScreen> createState() =>
      _PaymentOptionsScreenState();
}

class _PaymentOptionsScreenState extends ConsumerState<PaymentOptionsScreen> {
  final _notes = TextEditingController();
  final _coupon = TextEditingController();
  String _paymentMethod = paymentOptions.first.code;
  bool _applyingCoupon = false;
  bool _removingCoupon = false;

  @override
  void dispose() {
    _notes.dispose();
    _coupon.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon() async {
    if (_applyingCoupon || _coupon.text.trim().isEmpty) return;
    setState(() => _applyingCoupon = true);
    final result = await ref
        .read(cartControllerProvider.notifier)
        .applyCoupon(_coupon.text.trim());
    if (!mounted) return;
    setState(() => _applyingCoupon = false);
    if (result case Failed(failure: final f)) showFailure(context, f);
  }

  Future<void> _removeCoupon() async {
    if (_removingCoupon) return;
    setState(() => _removingCoupon = true);
    final result =
        await ref.read(cartControllerProvider.notifier).removeCoupon();
    if (!mounted) return;
    setState(() => _removingCoupon = false);
    if (result case Failed(failure: final f)) showFailure(context, f);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final couponCode =
        ref.watch(cartControllerProvider).asData?.value.couponCode;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.checkout)),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.margin),
              children: [
                Text(l10n.paymentMethod,
                    style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: AppSpacing.xs),
                RadioGroup<String>(
                  groupValue: _paymentMethod,
                  onChanged: (v) => setState(() => _paymentMethod = v!),
                  child: Column(
                    children: [
                      for (final option in paymentOptions)
                        RadioListTile<String>(
                          contentPadding: EdgeInsets.zero,
                          dense: true,
                          value: option.code,
                          secondary: Icon(option.icon),
                          title: Text(option.label(l10n)),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(l10n.couponCode,
                    style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: AppSpacing.xs),
                if (couponCode == null)
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _coupon,
                          textInputAction: TextInputAction.done,
                          onSubmitted: (_) => _applyCoupon(),
                          decoration:
                              InputDecoration(labelText: l10n.couponCode),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      _applyingCoupon
                          ? const Padding(
                              padding: EdgeInsets.all(AppSpacing.sm),
                              child: SizedBox(
                                  width: 20, height: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2)),
                            )
                          : TextButton(
                              onPressed: _applyCoupon,
                              child: Text(l10n.apply)),
                    ],
                  )
                else
                  Row(
                    children: [
                      Icon(Icons.local_offer_outlined,
                          size: 18, color: scheme.primary),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                          child: Text(couponCode,
                              style:
                                  Theme.of(context).textTheme.bodyMedium)),
                      _removingCoupon
                          ? const Padding(
                              padding: EdgeInsets.all(AppSpacing.sm),
                              child: SizedBox(
                                  width: 20, height: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2)),
                            )
                          : TextButton(
                              onPressed: _removeCoupon,
                              child: Text(l10n.remove)),
                    ],
                  ),
                const SizedBox(height: AppSpacing.md),
                Text(l10n.notesOptional,
                    style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: AppSpacing.xs),
                TextField(
                  controller: _notes,
                  maxLines: 3,
                  decoration: InputDecoration(hintText: l10n.notesHint),
                ),
              ],
            ),
          ),
          SafeArea(
            minimum: const EdgeInsets.all(AppSpacing.margin),
            child: SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => context.push(
                  Routes.checkout,
                  extra: CheckoutDraft(
                    addressId: widget.addressId,
                    paymentMethod: _paymentMethod,
                    notes: _notes.text.trim(),
                  ),
                ),
                child: Text(l10n.reviewOrder),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
