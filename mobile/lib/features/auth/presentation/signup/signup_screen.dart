import 'package:flutter/gestures.dart';
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
  String? _gender; // 'FEMALE' | 'MALE' — required, no default.
  bool _loading = false;
  late final _termsTap = TapGestureRecognizer()
    ..onTap = () => context.push(Routes.terms);
  late final _privacyTap = TapGestureRecognizer()
    ..onTap = () => context.push(Routes.privacy);

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _password.dispose();
    _termsTap.dispose();
    _privacyTap.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty ||
        _phone.text.trim().isEmpty ||
        _password.text.isEmpty) {
      showMessage(context, context.l10n.namePhonePasswordRequired);
      return;
    }
    if (_gender == null) {
      showMessage(context, context.l10n.genderRequired);
      return;
    }
    setState(() => _loading = true);
    final result = await ref.read(authControllerProvider.notifier).register(
          name: _name.text.trim(),
          gender: _gender!,
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
        _GenderSelector(
          value: _gender,
          onChanged: (v) => setState(() => _gender = v),
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
        const SizedBox(height: AppSpacing.md),
        _agreementNotice(context),
      ],
    );
  }

  /// "By creating an account you agree to our Terms and Privacy" with tappable
  /// links. Sentinels mark the link slots so each translation keeps its own
  /// word order (the legal routes are logged-out-reachable — see app_router).
  Widget _agreementNotice(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    final baseStyle = theme.textTheme.bodySmall
        ?.copyWith(color: theme.colorScheme.onSurfaceVariant);
    final linkStyle = theme.textTheme.bodySmall?.copyWith(
      color: theme.colorScheme.primary,
      fontWeight: FontWeight.w600,
    );

    final raw = l10n.signupAgreeNotice('[[T]]', '[[P]]');
    final spans = <InlineSpan>[];
    var cursor = 0;
    for (final match in RegExp(r'\[\[(T|P)\]\]').allMatches(raw)) {
      if (match.start > cursor) {
        spans.add(TextSpan(text: raw.substring(cursor, match.start)));
      }
      final isTerms = match[1] == 'T';
      spans.add(TextSpan(
        text: isTerms ? l10n.termsTitle : l10n.privacyTitle,
        style: linkStyle,
        recognizer: isTerms ? _termsTap : _privacyTap,
      ));
      cursor = match.end;
    }
    if (cursor < raw.length) spans.add(TextSpan(text: raw.substring(cursor)));

    return Text.rich(
      TextSpan(style: baseStyle, children: spans),
      textAlign: TextAlign.center,
    );
  }
}

/// Required two-choice (Female / Male) gender picker, styled as a pair of
/// ChoiceChips to match the app's pill aesthetic. No default selection.
class _GenderSelector extends StatelessWidget {
  const _GenderSelector({required this.value, required this.onChanged});

  final String? value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.gender, style: theme.textTheme.labelLarge),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                label: SizedBox(
                  width: double.infinity,
                  child: Text(l10n.genderFemale, textAlign: TextAlign.center),
                ),
                selected: value == 'FEMALE',
                onSelected: (_) => onChanged('FEMALE'),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: ChoiceChip(
                label: SizedBox(
                  width: double.infinity,
                  child: Text(l10n.genderMale, textAlign: TextAlign.center),
                ),
                selected: value == 'MALE',
                onSelected: (_) => onChanged('MALE'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
