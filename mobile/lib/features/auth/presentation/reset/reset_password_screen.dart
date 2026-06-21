import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../providers/auth_controller.dart';
import '../widgets/auth_widgets.dart';

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
  bool _loading = false;

  @override
  void dispose() {
    _phone.dispose();
    _code.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_phone.text.trim().isEmpty ||
        _code.text.trim().isEmpty ||
        _password.text.isEmpty) {
      showMessage(context, 'Fill in the code and your new password.');
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
        showMessage(context, 'Password updated. Please log in.');
        context.go(Routes.login);
      case Failed(failure: final failure):
        showFailure(context, failure);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: const RozhnaAppBar(showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.margin),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('New password', style: text.headlineMedium),
              const SizedBox(height: AppSpacing.sm),
              Text('Enter the code we sent and choose a new password.',
                  style: text.bodyLarge),
              const SizedBox(height: AppSpacing.xl),
              AuthField(
                controller: _phone,
                label: 'Phone number',
                prefixText: '+964 ',
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: AppSpacing.md),
              AuthField(
                controller: _code,
                label: 'Reset code',
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.oneTimeCode],
              ),
              const SizedBox(height: AppSpacing.md),
              PasswordField(
                controller: _password,
                label: 'New password (min 8 characters)',
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: 'Save password',
                loading: _loading,
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
