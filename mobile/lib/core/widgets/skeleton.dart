import 'package:flutter/material.dart';

import '../../app/theme/app_radii.dart';

/// A single grey placeholder shape. Colour comes from the theme so skeletons
/// adapt to dark mode. Wrap a tree of these in [Shimmer] to animate them.
class SkeletonBox extends StatelessWidget {
  const SkeletonBox({
    super.key,
    this.width,
    this.height,
    this.shape = BoxShape.rectangle,
    this.radius,
  });

  final double? width;
  final double? height;
  final BoxShape shape;
  final BorderRadius? radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        shape: shape,
        borderRadius: shape == BoxShape.circle ? null : (radius ?? AppRadii.cardRadius),
      ),
    );
  }
}

/// Sweeps a light band across the opaque ([SkeletonBox]) parts of [child] to
/// give the "shimmering placeholder" loading look. No external package.
class Shimmer extends StatefulWidget {
  const Shimmer({super.key, required this.child});

  final Widget child;

  @override
  State<Shimmer> createState() => _ShimmerState();
}

class _ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late final AnimationController _controller =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))
        ..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final base = scheme.surfaceContainerHighest;
    final highlight =
        Color.alphaBlend(scheme.surface.withValues(alpha: 0.7), base);

    return AnimatedBuilder(
      animation: _controller,
      child: widget.child,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            final dx = bounds.width * (_controller.value * 2 - 1);
            return LinearGradient(
              colors: [base, highlight, base],
              stops: const [0.35, 0.5, 0.65],
              transform: _SlideTransform(dx),
            ).createShader(bounds);
          },
          child: child,
        );
      },
    );
  }
}

class _SlideTransform extends GradientTransform {
  const _SlideTransform(this.dx);

  final double dx;

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) =>
      Matrix4.translationValues(dx, 0, 0);
}
