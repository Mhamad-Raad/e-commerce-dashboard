import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/network/api_result.dart';
import '../../../../core/widgets/brand_wordmark.dart';
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
      showMessage(context, context.l10n.enterPhoneAndPassword);
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
        showMessage(context, context.l10n.verifyToContinue);
        context.push(Routes.otp, extra: {'phone': _phone.text.trim()});
      } else {
        showFailure(context, failure);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    return AuthScaffold(
      children: [
        const BrandWordmark(),
        const SizedBox(height: AppSpacing.sm),
        Text(l10n.loginSubtitle, textAlign: TextAlign.center, style: text.bodyLarge),
        const SizedBox(height: AppSpacing.xl),
        AuthField(
          controller: _phone,
          label: l10n.phoneNumber,
          prefixText: '+964 ',
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.telephoneNumber],
        ),
        const SizedBox(height: AppSpacing.md),
        PasswordField(
          controller: _password,
          label: l10n.password,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.xs),
        Align(
          alignment: AlignmentDirectional.centerEnd,
          child: TextButton(
            onPressed: () => context.push(Routes.forgotPassword),
            child: Text(l10n.forgotPassword),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        PrimaryButton(label: l10n.logIn, loading: _loading, onPressed: _submit),
        const SizedBox(height: AppSpacing.md),
        Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(l10n.newHere),
            TextButton(
              onPressed: () => context.push(Routes.signup),
              child: Text(l10n.createAccount),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        // Let visitors sample the skincare assistant before committing to an
        // account — a low-friction hook into the consultation experience.
        TextButton.icon(
          onPressed: () => context.push(Routes.guestAssistant),
          icon: const Icon(Icons.auto_awesome_outlined, size: 18),
          label: Text(l10n.assistantGuestCta),
        ),
      ],
    );
  }
}
