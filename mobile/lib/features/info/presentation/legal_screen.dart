import 'package:flutter/material.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';

enum LegalDoc { privacy, terms }

/// Static localized legal text (privacy policy / terms of use).
class LegalScreen extends StatelessWidget {
  const LegalScreen({super.key, required this.doc});

  final LegalDoc doc;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final title = doc == LegalDoc.privacy ? l10n.privacyTitle : l10n.termsTitle;
    final body = doc == LegalDoc.privacy ? l10n.privacyBody : l10n.termsBody;

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
