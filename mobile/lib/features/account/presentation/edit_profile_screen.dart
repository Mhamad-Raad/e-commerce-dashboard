import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../auth/presentation/providers/auth_controller.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';

/// Edit the customer's name + email, and change the avatar (picked from the
/// gallery and uploaded immediately).
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  late final TextEditingController _name;
  late final TextEditingController _email;
  bool _saving = false;
  bool _uploadingAvatar = false;

  @override
  void initState() {
    super.initState();
    final customer = ref.read(authControllerProvider).customer;
    _name = TextEditingController(text: customer?.name ?? '');
    _email = TextEditingController(text: customer?.email ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (picked == null) return;
    setState(() => _uploadingAvatar = true);
    final result =
        await ref.read(authControllerProvider.notifier).uploadAvatar(picked.path);
    if (!mounted) return;
    setState(() => _uploadingAvatar = false);
    switch (result) {
      case Success():
        showMessage(context, context.l10n.avatarUpdated);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  Future<void> _save() async {
    final l10n = context.l10n;
    if (_name.text.trim().isEmpty) {
      showMessage(context, l10n.nameRequired);
      return;
    }
    setState(() => _saving = true);
    final email = _email.text.trim();
    final result = await ref.read(authControllerProvider.notifier).updateProfile(
          name: _name.text.trim(),
          // Omit when blank: the backend's @IsEmail rejects an empty string, and
          // a null simply leaves the email unchanged.
          email: email.isEmpty ? null : email,
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

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final customer = ref.watch(authControllerProvider).customer;

    return AuthScaffold(
      appBar: AppBar(title: Text(l10n.editProfile)),
      children: [
        Center(
          child: Column(
            children: [
              _Avatar(
                avatarUrl: customer?.avatarUrl,
                initial: (customer?.name.isNotEmpty ?? false)
                    ? customer!.name[0].toUpperCase()
                    : '?',
                uploading: _uploadingAvatar,
                onTap: _uploadingAvatar ? null : _pickAvatar,
              ),
              TextButton.icon(
                onPressed: _uploadingAvatar ? null : _pickAvatar,
                icon: const Icon(Icons.photo_camera_outlined, size: 18),
                label: Text(l10n.changePhoto),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _name,
          label: l10n.fullName,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _email,
          label: l10n.emailOptional,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(
          label: l10n.saveChanges,
          loading: _saving,
          onPressed: _save,
        ),
      ],
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({
    required this.avatarUrl,
    required this.initial,
    required this.uploading,
    required this.onTap,
  });

  final String? avatarUrl;
  final String initial;
  final bool uploading;
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
          children: [
            ClipOval(
              child: (avatarUrl != null && avatarUrl!.isNotEmpty)
                  ? AppNetworkImage(url: avatarUrl)
                  : Container(
                      color: scheme.primaryContainer,
                      alignment: Alignment.center,
                      child: Text(initial,
                          style: Theme.of(context).textTheme.headlineMedium),
                    ),
            ),
            if (uploading)
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: scheme.scrim.withValues(alpha: 0.4),
                ),
                child: const Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }
}
