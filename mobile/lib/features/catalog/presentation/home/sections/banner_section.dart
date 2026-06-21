import 'package:flutter/material.dart';

import '../../../domain/home_section.dart';
import '../home_navigation.dart';
import '../widgets/hero_carousel.dart';

/// BANNER section — a swipeable promo/ad carousel.
class BannerSection extends StatelessWidget {
  const BannerSection({super.key, required this.section});

  final HomeSection section;

  @override
  Widget build(BuildContext context) {
    final slides = [
      for (final item in section.items)
        BannerSlide(
          imageUrl: item.imageUrl ?? item.product?.imageUrl,
          title: item.label,
          subtitle: item.subtitle,
          badge: item.badge,
          ctaLabel: item.ctaLabel,
          onTap: () => navigateToHomeTarget(context, item),
        ),
    ];
    return HeroCarousel(slides: slides);
  }
}
