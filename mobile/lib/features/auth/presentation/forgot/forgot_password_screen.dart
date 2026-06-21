import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../providers/auth_controller.dart';
import '../widgets/auth_widgets.dart';

/// Step 1 of reset: enter the phone number. The backend is existence-blind
/// (always succeeds), so we always advance to the reset step without revealing
/// whether the number is registered.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _phone = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_phone.text.trim().isEmpty) {
      showMessage(context, context.l10n.enterPhone);
      return;
    }
    setState(() => _loading = true);
    final result = await ref
        .read(authControllerProvider.notifier)
        .forgotPassword(_phone.text.trim());
    if (!mounted) return;
    setState(() => _loading = false);
    switch (result) {
      case Success():
        showMessage(context, context.l10n.ifRegisteredCodeSent);
        context.push(Routes.resetPassword, extra: {'phone': _phone.text.trim()});
      case Failed(failure: final failure):
        showFailure(context, failure);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    return AuthScaffold(
      appBar: const RozhnaAppBar(showBack: true),
      children: [
        Text(l10n.resetPassword, style: text.headlineMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(l10n.forgotSubtitle, style: text.bodyLarge),
        const SizedBox(height: AppSpacing.xl),
        AuthField(
          controller: _phone,
          label: l10n.phoneNumber,
          prefixText: '+964 ',
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.done,
          autofillHints: const [AutofillHints.telephoneNumber],
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(label: l10n.sendCode, loading: _loading, onPressed: _submit),
      ],
    );
  }
}
