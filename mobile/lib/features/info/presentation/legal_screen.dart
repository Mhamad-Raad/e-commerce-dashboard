import 'package:flutter/material.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';

enum LegalDoc { privacy, terms, returns, shipping }

/// Static localized policy text (privacy / terms / returns / shipping).
class LegalScreen extends StatelessWidget {
  const LegalScreen({super.key, required this.doc});

  final LegalDoc doc;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final (title, body) = switch (doc) {
      LegalDoc.privacy => (l10n.privacyTitle, l10n.privacyBody),
      LegalDoc.terms => (l10n.termsTitle, l10n.termsBody),
      LegalDoc.returns => (l10n.returnPolicyTitle, l10n.returnPolicyBody),
      LegalDoc.shipping => (l10n.shippingPolicyTitle, l10n.shippingPolicyBody),
    };

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          Text(
            body,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(height: 1.6),
          ),
        ],
      ),
    );
  }
}
