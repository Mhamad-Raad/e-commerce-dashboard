import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/network/api_result.dart';
import '../providers/auth_controller.dart';
import '../widgets/auth_widgets.dart';

/// Phone + password login. WhatsApp is verification-only — not a login method.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_phone.text.trim().isEmpty || _password.text.isEmpty) {
      showMessage(context, 'Enter your phone number and password.');
      return;
    }
    setState(() => _loading = true);
    final result = await ref
        .read(authControllerProvider.notifier)
        .login(_phone.text.trim(), _password.text);
    if (!mounted) return;
    setState(() => _loading = false);

    // On success the router redirects to home. Only failures need handling here.
    if (result case Failed(failure: final failure)) {
      if (failure is PhoneNotVerifiedFailure) {
        showMessage(context, 'Verify your number to continue — we sent a code.');
        context.push(Routes.otp, extra: {'phone': _phone.text.trim()});
      } else {
        showFailure(context, failure);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.margin),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  "Rozhna's Store",
                  textAlign: TextAlign.center,
                  style: text.displayLarge?.copyWith(color: AppColors.berry),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text('Log in to continue',
                    textAlign: TextAlign.center, style: text.bodyLarge),
                const SizedBox(height: AppSpacing.xl),
                AuthField(
                  controller: _phone,
                  label: 'Phone number',
                  prefixText: '+964 ',
                  keyboardType: TextInputType.phone,
                  textInputAction: TextInputAction.next,
                  autofillHints: const [AutofillHints.telephoneNumber],
                ),
                const SizedBox(height: AppSpacing.md),
                PasswordField(
                  controller: _password,
                  textInputAction: TextInputAction.done,
                ),
                const SizedBox(height: AppSpacing.xs),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.push(Routes.forgotPassword),
                    child: const Text('Forgot password?'),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                PrimaryButton(
                  label: 'Log in',
                  loading: _loading,
                  onPressed: _submit,
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('New here?'),
                    TextButton(
                      onPressed: () => context.push(Routes.signup),
                      child: const Text('Create account'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
