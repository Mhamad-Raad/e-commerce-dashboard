import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../providers/auth_controller.dart';
import '../widgets/auth_widgets.dart';

/// Create account: name + phone + password (+ optional email). On success the
/// backend sends a WhatsApp OTP and we move to verification. If the number is
/// already registered the backend returns 409 *without sending an OTP*, so we
/// route to login instead of the OTP screen — no wasted verification cost.
class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty ||
        _phone.text.trim().isEmpty ||
        _password.text.isEmpty) {
      showMessage(context, context.l10n.namePhonePasswordRequired);
      return;
    }
    setState(() => _loading = true);
    final result = await ref.read(authControllerProvider.notifier).register(
          name: _name.text.trim(),
          phone: _phone.text.trim(),
          password: _password.text,
          email: _email.text.trim(),
        );
    if (!mounted) return;
    setState(() => _loading = false);

    switch (result) {
      case Success():
        // OTP was sent — go verify.
        context.push(Routes.otp, extra: {'phone': _phone.text.trim()});
      case Failed(failure: final failure):
        if (failure is ConflictFailure) {
          // Number already has an account — no OTP was sent. Send them to login.
          showMessage(context, context.l10n.numberAlreadyRegistered);
          context.go(Routes.login);
        } else {
          showFailure(context, failure);
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthScaffold(
      appBar: const RozhnaAppBar(showBack: true),
      children: [
        Text(l10n.createYourAccount,
            style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: AppSpacing.lg),
        AuthField(
          controller: _name,
          label: l10n.fullName,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.name],
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _phone,
          label: l10n.phoneNumber,
          prefixText: '+964 ',
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.telephoneNumber],
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _email,
          label: l10n.emailOptional,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.email],
        ),
        const SizedBox(height: AppSpacing.md),
        PasswordField(
          controller: _password,
          label: l10n.passwordMin8,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.xl),
        PrimaryButton(
          label: l10n.createAccount,
          loading: _loading,
          onPressed: _submit,
        ),
      ],
    );
  }
}
