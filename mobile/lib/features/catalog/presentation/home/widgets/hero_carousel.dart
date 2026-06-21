import 'package:flutter/material.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/app_network_image.dart';
import '../../../domain/hero_banner.dart';

/// Swipeable hero banners with a dot indicator. A gradient scrim keeps the
/// title/subtitle legible over any image.
class HeroCarousel extends StatefulWidget {
  const HeroCarousel({super.key, required this.banners});

  final List<HeroBanner> banners;

  @override
  State<HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<HeroCarousel> {
  final _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final banners = widget.banners;
    if (banners.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        SizedBox(
          height: AppSizes.heroHeight,
          child: PageView.builder(
            controller: _controller,
            itemCount: banners.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) => _Slide(banner: banners[i]),
          ),
        ),
        if (banners.length > 1) ...[
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(banners.length, (i) => _Dot(active: i == _index)),
          ),
        ],
      ],
    );
  }
}

class _Slide extends StatelessWidget {
  const _Slide({required this.banner});

  final HeroBanner banner;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
      child: ClipRRect(
        borderRadius: AppRadii.cardRadius,
        child: Stack(
          fit: StackFit.expand,
          children: [
            AppNetworkImage(url: banner.imageUrl),
            // Scrim for text legibility over the image.
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black54],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    banner.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: text.titleLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (banner.subtitle != null)
                    Text(
                      banner.subtitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: text.bodySmall?.copyWith(color: Colors.white70),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  const _Dot({required this.active});

  final bool active;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.xs / 2),
      width: active ? AppSpacing.md : AppSpacing.sm,
      height: AppSpacing.sm,
      decoration: BoxDecoration(
        color: active ? scheme.primary : scheme.outlineVariant,
        borderRadius: AppRadii.pill,
      ),
    );
  }
}
