import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/error/failure.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/rozhna_app_bar.dart';
import '../../../core/widgets/skeleton.dart';
import '../data/blog_repository.dart';

/// Full story/blog article reader.
class BlogArticleScreen extends ConsumerWidget {
  const BlogArticleScreen({super.key, required this.id});

  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final post = ref.watch(blogPostProvider(id));
    final lang = Localizations.localeOf(context).languageCode;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: const RozhnaAppBar(showBack: true),
      body: post.when(
        loading: () => const _ArticleSkeleton(),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.margin),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  error is Failure ? error.message : context.l10n.comingSoon,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.md),
                FilledButton(
                  onPressed: () => ref.invalidate(blogPostProvider(id)),
                  child: Text(context.l10n.retry),
                ),
              ],
            ),
          ),
        ),
        data: (article) => ListView(
          children: [
            if (article.coverImage != null)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(AppRadii.card),
                ),
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: AppNetworkImage(url: article.coverImage),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.margin),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(article.title(lang), style: text.headlineMedium),
                  const SizedBox(height: AppSpacing.md),
                  // TODO(blog): render rich HTML/markdown body (flutter_html /
                  // flutter_markdown) — plain text for the skeleton.
                  Text(article.body(lang) ?? '', style: text.bodyLarge),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Loading placeholder mirroring the article (cover → title → body lines).
class _ArticleSkeleton extends StatelessWidget {
  const _ArticleSkeleton();

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        children: [
          const SkeletonBox(
            height: 200,
            radius: BorderRadius.vertical(bottom: Radius.circular(AppRadii.card)),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.margin),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SkeletonBox(width: 220, height: 28),
                const SizedBox(height: AppSpacing.lg),
                for (var i = 0; i < 6; i++) ...[
                  const SkeletonBox(height: 14),
                  const SizedBox(height: AppSpacing.sm),
                ],
                const SkeletonBox(width: 180, height: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
