import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../data/contact_info.dart';

/// Contact channels, server-driven from dashboard Settings: tap-to-call,
/// WhatsApp, email, and the business address. Rows with no data are hidden.
class ContactScreen extends ConsumerWidget {
  const ContactScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final infoAsync = ref.watch(contactInfoProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.contactTitle)),
      body: infoAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.contactLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(contactInfoProvider),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (info) => ListView(
          padding: const EdgeInsets.all(AppSpacing.margin),
          children: [
            Text(l10n.contactSubtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant)),
            const SizedBox(height: AppSpacing.md),
            if (info.phone != null) ...[
              _ContactTile(
                icon: Icons.call_outlined,
                title: l10n.contactCall,
                subtitle: info.phone!,
                onTap: () => launchUrl(Uri.parse('tel:${info.phone}')),
              ),
              if (info.whatsAppNumber != null)
                _ContactTile(
                  icon: Icons.chat_outlined,
                  title: l10n.contactWhatsApp,
                  subtitle: info.phone!,
                  onTap: () => launchUrl(
                    Uri.parse('https://wa.me/${info.whatsAppNumber}'),
                    mode: LaunchMode.externalApplication,
                  ),
                ),
            ],
            if (info.email != null)
              _ContactTile(
                icon: Icons.mail_outline,
                title: l10n.contactEmail,
                subtitle: info.email!,
                onTap: () => launchUrl(Uri.parse('mailto:${info.email}')),
              ),
            if (info.address != null)
              _ContactTile(
                icon: Icons.location_on_outlined,
                title: l10n.contactAddress,
                subtitle: info.address!,
              ),
          ],
        ),
      ),
    );
  }
}

class _ContactTile extends StatelessWidget {
  const _ContactTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: AppRadii.cardRadius,
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: AppRadii.cardRadius),
        leading: Icon(icon, color: scheme.primary),
        title: Text(title),
        subtitle: Text(subtitle, textDirection: TextDirection.ltr),
        trailing: onTap == null ? null : const Icon(Icons.open_in_new, size: 18),
        onTap: onTap,
      ),
    );
  }
}
