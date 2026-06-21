import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

/// Cached network image with consistent loading + fallback. Handles null/empty
/// URLs (placeholder) so callers don't repeat that everywhere.
class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    super.key,
    required this.url,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
  });

  final String? url;
  final double? width;
  final double? height;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    if (url == null || url!.isEmpty) {
      return _fallback(context);
    }
    return CachedNetworkImage(
      imageUrl: url!,
      width: width,
      height: height,
      fit: fit,
      placeholder: (_, _) => _box(context, child: null),
      errorWidget: (_, _, _) => _fallback(context),
    );
  }

  Widget _fallback(BuildContext context) => _box(
        context,
        child: Icon(
          Icons.image_outlined,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      );

  Widget _box(BuildContext context, {required Widget? child}) => Container(
        width: width,
        height: height,
        alignment: Alignment.center,
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        child: child,
      );
}
