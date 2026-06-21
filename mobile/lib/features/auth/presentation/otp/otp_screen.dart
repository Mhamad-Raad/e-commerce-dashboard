import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
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
      showMessage(context, context.l10n.enterTheCode);
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
    final result = await ref
        .read(authControllerProvider.notifier)
        .resendVerification(widget.phone);
    if (!mounted) return;
    switch (result) {
      case Success():
        showMessage(context, context.l10n.newCodeSent);
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
        Text(l10n.verifyYourNumber, style: text.headlineMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(l10n.otpSentTo(widget.phone), style: text.bodyLarge),
        const SizedBox(height: AppSpacing.xl),
        AuthField(
          controller: _code,
          label: l10n.verificationCode,
          keyboardType: TextInputType.number,
          textInputAction: TextInputAction.done,
          autofillHints: const [AutofillHints.oneTimeCode],
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(label: l10n.verify, loading: _loading, onPressed: _verify),
        const SizedBox(height: AppSpacing.sm),
        // TODO(auth): add a resend countdown to match the backend cooldown.
        TextButton(onPressed: _resend, child: Text(l10n.resendCode)),
      ],
    );
  }
}
