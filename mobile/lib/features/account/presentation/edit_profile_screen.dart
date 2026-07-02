import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../auth/presentation/providers/auth_controller.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';

/// One-form profile editor (modeled on the reference app): avatar with a
/// camera badge (uploaded WITH save, not instantly), sectioned fields with
/// inline validation, a dirty-state-gated save button, a security tile to
/// change-password, and account deletion at the bottom.
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _email;
  String? _gender;
  XFile? _pendingAvatar;
  bool _saving = false;
  bool _dirty = false;

  // Originals for dirty-state detection — save stays disabled until something
  // actually changed.
  late final String _origName;
  late final String _origEmail;
  late final String? _origGender;

  @override
  void initState() {
    super.initState();
    final customer = ref.read(authControllerProvider).customer;
    _origName = customer?.name ?? '';
    _origEmail = customer?.email ?? '';
    _origGender = customer?.gender;
    _name = TextEditingController(text: _origName);
    _email = TextEditingController(text: _origEmail);
    _gender = _origGender;
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  void _recomputeDirty() {
    final dirty = _name.text.trim() != _origName ||
        _email.text.trim() != _origEmail ||
        _gender != _origGender ||
        _pendingAvatar != null;
    if (dirty != _dirty) setState(() => _dirty = dirty);
  }

  Future<void> _pickAvatar() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (picked == null || !mounted) return;
    setState(() => _pendingAvatar = picked);
    _recomputeDirty();
  }

  Future<void> _save() async {
    if (_saving || !_formKey.currentState!.validate()) return;
    final l10n = context.l10n;
    setState(() => _saving = true);

    // Avatar first — if it fails, stop and keep the form dirty for a retry.
    if (_pendingAvatar != null) {
      final result = await ref
          .read(authControllerProvider.notifier)
          .uploadAvatar(_pendingAvatar!.path);
      if (!mounted) return;
      if (result case Failed(failure: final f)) {
        setState(() => _saving = false);
        showFailure(context, f);
        return;
      }
      _pendingAvatar = null;
    }

    final email = _email.text.trim();
    final result = await ref.read(authControllerProvider.notifier).updateProfile(
          name: _name.text.trim(),
          // Omit when blank: the backend's @IsEmail rejects an empty string, and
          // a null simply leaves the email unchanged.
          email: email.isEmpty ? null : email,
          gender: _gender,
        );
    if (!mounted) return;
    setState(() => _saving = false);
    switch (result) {
      case Success():
        showMessage(context, l10n.profileUpdated);
        context.pop();
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  Future<void> _confirmDelete() async {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.deleteAccountConfirmTitle),
        content: Text(l10n.deleteAccountConfirmBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: scheme.error,
              foregroundColor: scheme.onError,
            ),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    final result =
        await ref.read(authControllerProvider.notifier).deleteAccount();
    // Success flips auth state — the router redirects to login on its own.
    if (!mounted) return;
    if (result case Failed(failure: final f)) showFailure(context, f);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final customer = ref.watch(authControllerProvider).customer;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.editProfile)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.margin),
          child: Form(
            key: _formKey,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            onChanged: _recomputeDirty,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: _Avatar(
                    avatarUrl: customer?.avatarUrl,
                    pendingPath: _pendingAvatar?.path,
                    initial: (customer?.name.isNotEmpty ?? false)
                        ? customer!.name[0].toUpperCase()
                        : '?',
                    onTap: _saving ? null : _pickAvatar,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                _SectionLabel(l10n.accountInformation),
                TextFormField(
                  controller: _name,
                  decoration: InputDecoration(labelText: l10n.fullName),
                  textInputAction: TextInputAction.next,
                  validator: (v) =>
                      (v == null || v.trim().isEmpty) ? l10n.nameRequired : null,
                ),
                const SizedBox(height: AppSpacing.md),
                DropdownButtonFormField<String>(
                  initialValue: _gender,
                  decoration: InputDecoration(labelText: l10n.gender),
                  items: [
                    DropdownMenuItem(
                        value: 'FEMALE', child: Text(l10n.genderFemale)),
                    DropdownMenuItem(
                        value: 'MALE', child: Text(l10n.genderMale)),
                  ],
                  onChanged: _saving
                      ? null
                      : (v) {
                          setState(() => _gender = v);
                          _recomputeDirty();
                        },
                ),
                const SizedBox(height: AppSpacing.lg),
                _SectionLabel(l10n.contactInformation),
                TextFormField(
                  controller: _email,
                  decoration: InputDecoration(
                    labelText: l10n.emailOptional,
                    prefixIcon: const Icon(Icons.mail_outline),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  validator: (v) {
                    final value = v?.trim() ?? '';
                    if (value.isEmpty) return null;
                    final ok =
                        RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value);
                    return ok ? null : l10n.emailInvalid;
                  },
                ),
                if (customer?.phone != null) ...[
                  const SizedBox(height: AppSpacing.md),
                  // The phone is the login identity — changing it would need an
                  // OTP re-verification flow, so it's shown read-only.
                  TextFormField(
                    enabled: false,
                    initialValue: customer!.phone,
                    textDirection: TextDirection.ltr,
                    decoration: InputDecoration(
                      labelText: l10n.phoneNumber,
                      prefixIcon: const Icon(Icons.call_outlined),
                      suffixIcon: const Icon(Icons.lock_outline, size: 18),
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.lg),
                _SectionLabel(l10n.security),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: scheme.outlineVariant),
                    borderRadius: AppRadii.cardRadius,
                  ),
                  child: ListTile(
                    shape:
                        RoundedRectangleBorder(borderRadius: AppRadii.cardRadius),
                    leading: Icon(Icons.lock_reset, color: scheme.primary),
                    title: Text(l10n.changePassword),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push(Routes.changePassword),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),
                PrimaryButton(
                  label: l10n.saveChanges,
                  loading: _saving,
                  onPressed: _dirty && !_saving ? _save : null,
                ),
                const SizedBox(height: AppSpacing.md),
                TextButton(
                  onPressed: _saving ? null : _confirmDelete,
                  style: TextButton.styleFrom(foregroundColor: scheme.error),
                  child: Text(l10n.deleteAccount),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
      ),
    );
  }
}

/// 96px avatar with a camera badge (bottom-end). Shows the freshly-picked local
/// image before it's uploaded, else the network avatar, else the initial.
class _Avatar extends StatelessWidget {
  const _Avatar({
    required this.avatarUrl,
    required this.pendingPath,
    required this.initial,
    required this.onTap,
  });

  final String? avatarUrl;
  final String? pendingPath;
  final String initial;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 96,
        height: 96,
        child: Stack(
          fit: StackFit.expand,
          clipBehavior: Clip.none,
          children: [
            ClipOval(
              child: pendingPath != null
                  ? Image.file(File(pendingPath!), fit: BoxFit.cover)
                  : (avatarUrl != null && avatarUrl!.isNotEmpty)
                      ? AppNetworkImage(url: avatarUrl)
                      : Container(
                          color: scheme.primaryContainer,
                          alignment: Alignment.center,
                          child: Text(initial,
                              style:
                                  Theme.of(context).textTheme.headlineMedium),
                        ),
            ),
            PositionedDirectional(
              bottom: 0,
              end: 0,
              child: Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: scheme.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: scheme.surface, width: 2),
                ),
                child: Icon(Icons.photo_camera,
                    size: 16, color: scheme.onPrimary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
