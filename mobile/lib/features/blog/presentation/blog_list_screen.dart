import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/router/routes.dart';
import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/intl_locale.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/app_network_image.dart';
import '../../../core/widgets/skeleton.dart';
import '../data/blog_repository.dart';
import '../domain/blog_summary.dart';

/// All published stories/blog posts, newest first. Public — also reachable
/// while logged out (see the router's allowlist).
class BlogListScreen extends ConsumerWidget {
  const BlogListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final postsAsync = ref.watch(blogListProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.storiesTitle)),
      body: postsAsync.when(
        loading: () => const _BlogListSkeleton(),
        error: (_, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.blogLoadError),
              const SizedBox(height: AppSpacing.md),
              FilledButton(
                onPressed: () => ref.invalidate(blogListProvider),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (posts) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(blogListProvider);
            await ref.read(blogListProvider.future);
          },
          child: posts.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl * 2),
                      child: Column(
                        children: [
                          Icon(Icons.auto_stories_outlined,
                              size: 48,
                              color:
                                  Theme.of(context).colorScheme.onSurfaceVariant),
                          const SizedBox(height: AppSpacing.md),
                          Text(l10n.blogEmpty,
                              style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: AppSpacing.sm),
                          Text(l10n.blogEmptyHint, textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  ],
                )
              : ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(AppSpacing.margin),
                  itemCount: posts.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (_, i) => _PostCard(post: posts[i]),
                ),
        ),
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post});

  final BlogSummary post;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;

    return Card(
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      shape: const RoundedRectangleBorder(borderRadius: AppRadii.cardRadius),
      child: InkWell(
        onTap: () => context.push('${Routes.blog}/${post.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: AppNetworkImage(url: post.coverImage),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    post.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style:
                        text.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  if (post.excerpt != null && post.excerpt!.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      post.excerpt!,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: text.bodyMedium
                          ?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  ],
                  if (post.publishedAt != null) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      DateFormat.yMMMd(intlLocale(locale))
                          .format(post.publishedAt!),
                      style: text.bodySmall
                          ?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Loading placeholder mirroring the list (cover + text-block cards).
class _BlogListSkeleton extends StatelessWidget {
  const _BlogListSkeleton();

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.all(AppSpacing.margin),
        children: [
          for (var i = 0; i < 3; i++) ...[
            const SkeletonBox(height: 180),
            const SizedBox(height: AppSpacing.sm),
            const SkeletonBox(width: 220, height: 20),
            const SizedBox(height: AppSpacing.sm),
            const SkeletonBox(height: 14),
            const SizedBox(height: AppSpacing.lg),
          ],
        ],
      ),
    );
  }
}
