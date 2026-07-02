import 'package:flutter/material.dart';

import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../domain/home_section.dart';
import '../../../domain/home_section_item.dart';
import '../home_navigation.dart';
import '../widgets/product_card.dart';
import '../widgets/section_header.dart';

/// PRODUCTS section — a horizontal slider (default) or a grid (config.layout ==
/// 'grid') of product cards.
class ProductsSection extends StatelessWidget {
  const ProductsSection({super.key, required this.section});

  final HomeSection section;

  @override
  Widget build(BuildContext context) {
    final title = section.title;
    final items = section.items.where((i) => i.product != null).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) SectionHeader(title: title),
        if (section.layout == 'grid') _grid(context, items) else _slider(items),
      ],
    );
  }

  Widget _slider(List<HomeSectionItem> items) {
    return SizedBox(
      height: AppSizes.productSliderHeight,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
        itemCount: items.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.gutter),
        itemBuilder: (context, i) => SizedBox(
          width: AppSizes.productSliderItemWidth,
          child: ProductCard(
            product: items[i].product!,
            badge: items[i].badge,
            onTap: () => navigateToHomeTarget(context, items[i]),
          ),
        ),
      ),
    );
  }

  Widget _grid(BuildContext context, List<HomeSectionItem> items) {
    return LayoutBuilder(
      builder: (context, constraints) => GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
        gridDelegate:
            productGridDelegate(constraints.maxWidth - AppSpacing.margin * 2),
        itemCount: items.length,
        itemBuilder: (context, i) => ProductCard(
          product: items[i].product!,
          badge: items[i].badge,
          onTap: () => navigateToHomeTarget(context, items[i]),
        ),
      ),
    );
  }
}
