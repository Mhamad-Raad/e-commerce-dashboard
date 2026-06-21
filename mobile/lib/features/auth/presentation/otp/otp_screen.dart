import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../providers/auth_controller.dart';
import '../widgets/auth_widgets.dart';

/// WhatsApp OTP verification for sign-up. On success the account is verified and
/// auto-logged-in (the router then redirects home).
class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.phone});

  final String phone;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _code = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (_code.text.trim().isEmpty) {
      showMessage(context, 'Enter the code we sent you.');
      return;
    }
    setState(() => _loading = true);
    final result = await ref
        .read(authControllerProvider.notifier)
        .verifyPhone(widget.phone, _code.text.trim());
    if (!mounted) return;
    setState(() => _loading = false);
    // Success → auto-login → router redirects home. Handle failures only.
    if (result case Failed(failure: final failure)) {
      showFailure(context, failure);
    }
  }

  Future<void> _resend() async {
    final result =
        await ref.read(authControllerProvider.notifier).resendVerification(widget.phone);
    if (!mounted) return;
    switch (result) {
      case Success():
        showMessage(context, 'A new code is on its way.');
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
              Text('Verify your number', style: text.headlineMedium),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Enter the code we sent on WhatsApp to ${widget.phone}.',
                style: text.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.xl),
              AuthField(
                controller: _code,
                label: 'Verification code',
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.oneTimeCode],
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: 'Verify',
                loading: _loading,
                onPressed: _verify,
              ),
              const SizedBox(height: AppSpacing.sm),
              // TODO(auth): add a resend countdown to match the backend cooldown.
              TextButton(
                onPressed: _resend,
                child: const Text("Didn't get it? Resend code"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
