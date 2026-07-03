import 'package:flutter/material.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/l10n/l10n_ext.dart';

/// Article body renderer: markdown styled to the app theme. Plain-text bodies
/// are just paragraphs, so they render fine too. Direction (RTL for ar/ckb)
/// comes from the ambient [Directionality] — article language == app locale.
class BlogMarkdown extends StatelessWidget {
  const BlogMarkdown({super.key, required this.data});

  final String data;

  Future<void> _openLink(BuildContext context, String url) async {
    final messenger = ScaffoldMessenger.of(context);
    final errorText = context.l10n.linkOpenError;
    final uri = Uri.tryParse(url.trim());
    var opened = false;
    if (uri != null) {
      try {
        opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
      } catch (_) {
        opened = false;
      }
    }
    if (!opened) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(errorText)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final dark = Theme.of(context).brightness == Brightness.dark;

    final config =
        (dark ? MarkdownConfig.darkConfig : MarkdownConfig.defaultConfig).copy(
      configs: [
        PConfig(textStyle: text.bodyLarge ?? const TextStyle(fontSize: 16)),
        H1Config(style: text.headlineMedium ?? const TextStyle(fontSize: 24)),
        H2Config(style: text.titleLarge ?? const TextStyle(fontSize: 20)),
        H3Config(style: text.titleMedium ?? const TextStyle(fontSize: 16)),
        LinkConfig(
          style: TextStyle(
            color: scheme.primary,
            decoration: TextDecoration.underline,
            decorationColor: scheme.primary,
          ),
          onTap: (url) => _openLink(context, url),
        ),
      ],
    );

    return MarkdownBlock(data: data, config: config, selectable: false);
  }
}
