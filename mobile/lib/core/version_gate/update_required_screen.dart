import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../app/theme/app_spacing.dart';
import '../l10n/l10n_ext.dart';
import 'version_gate_controller.dart';

/// Hard version block — not dismissible (no back, no skip). The router keeps
/// every other location redirected here while the gate says blocked, so the
/// only way forward is the store update.
class UpdateRequiredScreen extends ConsumerWidget {
  const UpdateRequiredScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    final storeUrl = ref.watch(versionGateControllerProvider).storeUrl;

    return PopScope(
      canPop: false,
      child: Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: scheme.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.system_update_alt,
                        size: 56, color: scheme.primary),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Text(l10n.updateRequiredTitle,
                      style: text.headlineSmall, textAlign: TextAlign.center),
                  const SizedBox(height: AppSpacing.sm),
                  Text(l10n.updateRequiredBody,
                      style: text.bodyMedium
                          ?.copyWith(color: scheme.onSurfaceVariant),
                      textAlign: TextAlign.center),
                  const SizedBox(height: AppSpacing.xl),
                  if (storeUrl != null)
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () => launchUrl(Uri.parse(storeUrl),
                            mode: LaunchMode.externalApplication),
                        icon: const Icon(Icons.open_in_new),
                        label: Text(l10n.updateNow),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
