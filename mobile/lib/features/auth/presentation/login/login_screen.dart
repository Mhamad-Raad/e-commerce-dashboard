import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_spacing.dart';
import '../providers/auth_controller.dart';

/// Placeholder login — the real phone + password UI (from the Stitch design)
/// gets built here next. "Continue (demo)" stands in for a real login.
class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                "Rozhna's Store",
                style: text.displayLarge?.copyWith(color: AppColors.berry),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Login — phone + password (placeholder)',
                style: text.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.xl),
              FilledButton(
                onPressed: () => ref.read(isLoggedInProvider.notifier).logInDemo(),
                child: const Text('Continue (demo)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
