import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
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
      showMessage(context, 'Enter your phone number.');
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
        showMessage(context, 'If the number is registered, a code was sent.');
        context.push(Routes.resetPassword, extra: {'phone': _phone.text.trim()});
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
              Text('Reset password', style: text.headlineMedium),
              const SizedBox(height: AppSpacing.sm),
              Text(
                "Enter your phone number and we'll send a reset code on WhatsApp.",
                style: text.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.xl),
              AuthField(
                controller: _phone,
                label: 'Phone number',
                prefixText: '+964 ',
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.telephoneNumber],
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: 'Send code',
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
