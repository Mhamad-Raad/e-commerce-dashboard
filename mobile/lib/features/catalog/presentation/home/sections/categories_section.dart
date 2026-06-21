import 'package:flutter/material.dart';

import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../domain/home_section.dart';
import '../home_navigation.dart';
import '../widgets/circle_tile.dart';
import '../widgets/section_header.dart';

/// CATEGORIES section — a horizontal row of category circles.
class CategoriesSection extends StatelessWidget {
  const CategoriesSection({super.key, required this.section});

  final HomeSection section;

  @override
  Widget build(BuildContext context) {
    final lang = Localizations.localeOf(context).languageCode;
    final title = section.title(lang);
    final items = section.items.where((i) => i.category != null).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) SectionHeader(title: title),
        SizedBox(
          height: AppSizes.categoryAvatar + AppSpacing.xl + AppSpacing.sm,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
            itemBuilder: (_, i) {
              final item = items[i];
              return CircleTile(
                imageUrl: item.imageUrl ?? item.category!.imageUrl,
                label: item.label ?? item.category!.name,
                onTap: () => navigateToHomeTarget(context, item),
              );
            },
          ),
        ),
      ],
    );
  }
}
