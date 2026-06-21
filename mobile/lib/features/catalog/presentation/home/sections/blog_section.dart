import 'package:flutter/material.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/app_network_image.dart';
import '../../../../blog/domain/blog_summary.dart';
import '../../../domain/home_section.dart';
import '../home_navigation.dart';
import '../widgets/section_header.dart';

/// BLOG section — a horizontal carousel of story/blog cards.
class BlogSection extends StatelessWidget {
  const BlogSection({super.key, required this.section});

  final HomeSection section;

  @override
  Widget build(BuildContext context) {
    final lang = Localizations.localeOf(context).languageCode;
    final title = section.title(lang);
    final items = section.items.where((i) => i.blog != null).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) SectionHeader(title: title),
        SizedBox(
          height: AppSizes.blogSliderHeight,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.gutter),
            itemBuilder: (context, i) => _BlogCard(
              post: items[i].blog!,
              lang: lang,
              onTap: () => navigateToHomeTarget(context, items[i]),
            ),
          ),
        ),
      ],
    );
  }
}

class _BlogCard extends StatelessWidget {
  const _BlogCard({required this.post, required this.lang, this.onTap});

  final BlogSummary post;
  final String lang;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final excerpt = post.excerpt(lang);

    return SizedBox(
      width: AppSizes.blogCardWidth,
      child: Card(
        clipBehavior: Clip.antiAlias,
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.cardRadius),
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: AppNetworkImage(url: post.coverImage),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.title(lang),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: text.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    if (excerpt != null) ...[
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        excerpt,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: text.bodySmall?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
