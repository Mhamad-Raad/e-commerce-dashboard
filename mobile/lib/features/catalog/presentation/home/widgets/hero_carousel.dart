import 'package:flutter/material.dart';

import '../../../../../app/theme/app_radii.dart';
import '../../../../../app/theme/app_sizes.dart';
import '../../../../../app/theme/app_spacing.dart';
import '../../../../../core/widgets/app_network_image.dart';
import 'pill_badge.dart';

/// One banner slide: an image with an optional badge / serif headline / subtitle
/// / CTA overlay and a tap target.
class BannerSlide {
  const BannerSlide({
    this.imageUrl,
    this.title,
    this.subtitle,
    this.badge,
    this.ctaLabel,
    this.onTap,
  });

  final String? imageUrl;
  final String? title;
  final String? subtitle;
  final String? badge;
  final String? ctaLabel;
  final VoidCallback? onTap;
}

/// Swipeable hero banners with a dot indicator — editorial style: badge pill,
/// Bodoni headline, and a pill CTA over a scrimmed image.
class HeroCarousel extends StatefulWidget {
  const HeroCarousel({super.key, required this.slides});

  final List<BannerSlide> slides;

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
    final slides = widget.slides;
    if (slides.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        SizedBox(
          height: AppSizes.heroHeight,
          child: PageView.builder(
            controller: _controller,
            itemCount: slides.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) => _Slide(slide: slides[i]),
          ),
        ),
        if (slides.length > 1) ...[
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(slides.length, (i) => _Dot(active: i == _index)),
          ),
        ],
      ],
    );
  }
}

class _Slide extends StatelessWidget {
  const _Slide({required this.slide});

  final BannerSlide slide;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;
    final hasOverlay = [slide.title, slide.subtitle, slide.badge, slide.ctaLabel]
        .any((v) => v != null && v.isNotEmpty);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
      child: GestureDetector(
        onTap: slide.onTap,
        child: ClipRRect(
          borderRadius: AppRadii.cardRadius,
          child: Stack(
            fit: StackFit.expand,
            children: [
              AppNetworkImage(url: slide.imageUrl),
              if (hasOverlay)
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.black26, Colors.transparent, Colors.black87],
                      stops: [0, 0.45, 1],
                    ),
                  ),
                ),
              if (slide.badge != null && slide.badge!.isNotEmpty)
                Align(
                  alignment: AlignmentDirectional.topStart,
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: PillBadge(label: slide.badge!),
                  ),
                ),
              Align(
                alignment: AlignmentDirectional.bottomStart,
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (slide.title != null && slide.title!.isNotEmpty)
                        Text(
                          slide.title!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: text.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            height: 1.1,
                          ),
                        ),
                      if (slide.subtitle != null && slide.subtitle!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          slide.subtitle!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: text.bodySmall?.copyWith(color: Colors.white70),
                        ),
                      ],
                      if (slide.ctaLabel != null && slide.ctaLabel!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.sm),
                        FilledButton(
                          onPressed: slide.onTap,
                          style: FilledButton.styleFrom(
                            backgroundColor: scheme.primary,
                            foregroundColor: scheme.onPrimary,
                            minimumSize: const Size(0, 40),
                            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                            shape: const StadiumBorder(),
                          ),
                          child: Text(slide.ctaLabel!),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
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
