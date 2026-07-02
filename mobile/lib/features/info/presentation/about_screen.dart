import 'package:flutter/material.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';

/// Static localized "About us" — brand story + what sets the store apart.
class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.aboutTitle)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.06),
              borderRadius: AppRadii.cardRadius,
            ),
            child: Column(
              children: [
                Icon(Icons.storefront_outlined,
                    size: 48, color: scheme.primary),
                const SizedBox(height: AppSpacing.md),
                Text(
                  l10n.brandName,
                  style: text.headlineSmall?.copyWith(
                    color: scheme.primary,
                    fontStyle: FontStyle.italic,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(l10n.aboutIntro,
                    style: text.bodyLarge, textAlign: TextAlign.center),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(l10n.aboutStoryTitle, style: text.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(l10n.aboutBody1, style: text.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: AppSpacing.md),
          Text(l10n.aboutBody2, style: text.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: AppSpacing.lg),
          Text(l10n.aboutWhyTitle, style: text.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          _Feature(
            icon: Icons.verified_outlined,
            title: l10n.aboutFeature1Title,
            body: l10n.aboutFeature1Body,
          ),
          _Feature(
            icon: Icons.local_shipping_outlined,
            title: l10n.aboutFeature2Title,
            body: l10n.aboutFeature2Body,
          ),
          _Feature(
            icon: Icons.support_agent_outlined,
            title: l10n.aboutFeature3Title,
            body: l10n.aboutFeature3Body,
          ),
        ],
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.icon, required this.title, required this.body});

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: scheme.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: scheme.primary),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: text.titleSmall),
                const SizedBox(height: 2),
                Text(body,
                    style: text.bodySmall
                        ?.copyWith(color: scheme.onSurfaceVariant, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
