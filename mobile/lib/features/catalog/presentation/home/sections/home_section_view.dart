import 'package:flutter/material.dart';

import '../../../domain/home_section.dart';
import 'banner_section.dart';
import 'blog_section.dart';
import 'brands_section.dart';
import 'categories_section.dart';
import 'products_section.dart';

/// Maps a server-configured [HomeSection] to its widget. The single place that
/// knows the type → design mapping; unknown/empty sections render nothing so the
/// app is forward-compatible with new backend types.
class HomeSectionView extends StatelessWidget {
  const HomeSectionView({super.key, required this.section});

  final HomeSection section;

  @override
  Widget build(BuildContext context) {
    if (section.items.isEmpty) return const SizedBox.shrink();

    return switch (section.type) {
      HomeSectionType.banner => BannerSection(section: section),
      HomeSectionType.blog => BlogSection(section: section),
      HomeSectionType.brands => BrandsSection(section: section),
      HomeSectionType.categories => CategoriesSection(section: section),
      HomeSectionType.products => ProductsSection(section: section),
      HomeSectionType.unknown => const SizedBox.shrink(),
    };
  }
}
