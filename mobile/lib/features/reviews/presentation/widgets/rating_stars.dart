import 'package:flutter/material.dart';

/// Read-only star row for an average (supports half stars).
class RatingStars extends StatelessWidget {
  const RatingStars({super.key, required this.rating, this.size = 18});

  final double rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.tertiary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 1; i <= 5; i++)
          Icon(
            rating >= i - 0.25
                ? Icons.star_rounded
                : rating >= i - 0.75
                    ? Icons.star_half_rounded
                    : Icons.star_border_rounded,
            size: size,
            color: color,
          ),
      ],
    );
  }
}

/// Tappable 1–5 star input for the review editor.
class RatingStarsInput extends StatelessWidget {
  const RatingStarsInput({
    super.key,
    required this.value,
    required this.onChanged,
    this.size = 36,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final double size;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 1; i <= 5; i++)
          IconButton(
            onPressed: () => onChanged(i),
            visualDensity: VisualDensity.compact,
            icon: Icon(
              value >= i ? Icons.star_rounded : Icons.star_border_rounded,
              size: size,
              color: value >= i ? scheme.tertiary : scheme.outline,
            ),
          ),
      ],
    );
  }
}
