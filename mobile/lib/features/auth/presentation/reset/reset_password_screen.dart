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
import '../widgets/otp_code_input.dart';

/// Step 2 of reset: enter the code + a new password. On success all sessions are
/// revoked server-side, so we send the user back to login.
class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key, required this.phone});

  final String phone;

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  late final TextEditingController _phone =
      TextEditingController(text: widget.phone);
  final _code = TextEditingController();
  final _password = TextEditingController();
  final _passwordFocus = FocusNode();
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    _code.dispose();
    _password.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_phone.text.trim().isEmpty ||
        _code.text.trim().length < 6 ||
        _password.text.isEmpty) {
      showMessage(context, context.l10n.fillCodeAndPassword);
      return;
    }
    setState(() => _loading = true);
    final result =
        await ref.read(authControllerProvider.notifier).resetPassword(
              phone: _phone.text.trim(),
              code: _code.text.trim(),
              newPassword: _password.text,
            );
    if (!mounted) return;
    setState(() => _loading = false);
    switch (result) {
      case Success():
        showMessage(context, context.l10n.passwordUpdated);
        context.go(Routes.login);
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
        Text(l10n.newPasswordTitle, style: text.headlineMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(l10n.newPasswordSubtitle, style: text.bodyLarge),
        const SizedBox(height: AppSpacing.xl),
        AuthField(
          controller: _phone,
          label: l10n.phoneNumber,
          prefixText: '+964 ',
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        Text(l10n.resetCode, style: text.labelLarge),
        const SizedBox(height: AppSpacing.sm),
        OtpCodeInput(
          controller: _code,
          autofocus: false,
          closeKeyboardWhenCompleted: false,
          // The code is mid-form: completing it moves to the password instead
          // of submitting (the password is usually still empty here).
          onCompleted: (_) => _passwordFocus.requestFocus(),
        ),
        const SizedBox(height: AppSpacing.md),
        PasswordField(
          controller: _password,
          focusNode: _passwordFocus,
          label: l10n.newPasswordMin8,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(
          label: l10n.savePassword,
          loading: _loading,
          onPressed: _submit,
        ),
      ],
    );
  }
}
