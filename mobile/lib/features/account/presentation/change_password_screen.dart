import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../auth/presentation/providers/auth_controller.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';

/// Change the password while logged in (current + new). Sessions stay valid.
class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = context.l10n;
    if (_current.text.isEmpty || _next.text.isEmpty) {
      showMessage(context, l10n.fillCodeAndPassword);
      return;
    }
    if (_next.text.length < 8) {
      showMessage(context, l10n.passwordMin8);
      return;
    }
    if (_next.text != _confirm.text) {
      showMessage(context, l10n.passwordsDontMatch);
      return;
    }
    setState(() => _saving = true);
    final result = await ref.read(authControllerProvider.notifier).changePassword(
          currentPassword: _current.text,
          newPassword: _next.text,
        );
    if (!mounted) return;
    setState(() => _saving = false);
    switch (result) {
      case Success():
        showMessage(context, l10n.passwordChanged);
        context.pop();
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthScaffold(
      appBar: AppBar(title: Text(l10n.changePassword)),
      children: [
        PasswordField(
          controller: _current,
          label: l10n.currentPassword,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        PasswordField(
          controller: _next,
          label: l10n.newPasswordMin8,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        PasswordField(
          controller: _confirm,
          label: l10n.confirmPassword,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(
          label: l10n.savePassword,
          loading: _saving,
          onPressed: _submit,
        ),
      ],
    );
  }
}
