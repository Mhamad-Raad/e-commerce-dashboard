import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../providers/auth_controller.dart';
import '../widgets/auth_widgets.dart';
import '../widgets/otp_code_input.dart';

/// WhatsApp OTP verification for sign-up. On success the account is verified and
/// auto-logged-in (the router then redirects home).
class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.phone});

  final String phone;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  // Mirrors the backend's RESEND_COOLDOWN_MS (60s) so the button re-enables
  // right when the server would accept a resend, instead of surfacing a 429.
  static const _cooldownSeconds = 60;

  final _code = TextEditingController();
  bool _loading = false;
  bool _codeError = false;
  Timer? _timer;
  int _cooldown = 0;

  @override
  void initState() {
    super.initState();
    // A code was just sent to get here — start counting immediately.
    _startCooldown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _code.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _timer?.cancel();
    setState(() => _cooldown = _cooldownSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() => _cooldown--);
      if (_cooldown <= 0) t.cancel();
    });
  }

  Future<void> _verify() async {
    if (_loading) return;
    if (_code.text.trim().length < 6) {
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
      setState(() => _codeError = true);
      showFailure(context, failure);
    }
  }

  Future<void> _resend() async {
    if (_cooldown > 0) return;
    final result = await ref
        .read(authControllerProvider.notifier)
        .resendVerification(widget.phone);
    if (!mounted) return;
    switch (result) {
      case Success():
        showMessage(context, context.l10n.newCodeSent);
        _startCooldown();
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
        OtpCodeInput(
          controller: _code,
          forceError: _codeError,
          onChanged: (_) {
            if (_codeError) setState(() => _codeError = false);
          },
          onCompleted: (_) => _verify(),
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(label: l10n.verify, loading: _loading, onPressed: _verify),
        const SizedBox(height: AppSpacing.sm),
        TextButton(
          onPressed: _cooldown > 0 ? null : _resend,
          child: Text(_cooldown > 0
              ? l10n.resendCodeIn(context.localizedNumber(_cooldown))
              : l10n.resendCode),
        ),
      ],
    );
  }
}
