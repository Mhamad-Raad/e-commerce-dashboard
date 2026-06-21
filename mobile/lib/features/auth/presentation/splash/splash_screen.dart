import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';

/// Shown while the session is restored on launch (AuthStatus.unknown).
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Rozhna's Store",
              style: text.displayLarge?.copyWith(color: AppColors.berry),
            ),
            const SizedBox(height: AppSpacing.lg),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
