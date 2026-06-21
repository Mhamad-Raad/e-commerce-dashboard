import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../../data/home_repository.dart';
import '../../domain/home_section.dart';
import 'sections/home_section_view.dart';

/// Storefront landing — a server-driven, dashboard-built list of sections.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final layout = ref.watch(homeProvider);
    return Scaffold(
      appBar: const RozhnaAppBar(showCart: true),
      body: layout.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _HomeError(
          message: error is Failure ? error.message : context.l10n.homeLoadError,
          onRetry: () => ref.invalidate(homeProvider),
        ),
        data: (sections) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(homeProvider);
            await ref.read(homeProvider.future);
          },
          child: _HomeBody(sections: sections),
        ),
      ),
    );
  }
}

class _HomeBody extends StatelessWidget {
  const _HomeBody({required this.sections});

  final List<HomeSection> sections;

  @override
  Widget build(BuildContext context) {
    // Only render sections that have something to show.
    final visible = sections
        .where((s) =>
            s.type != HomeSectionType.unknown && s.items.isNotEmpty)
        .toList();

    if (visible.isEmpty) {
      // Keep it scrollable so pull-to-refresh still works.
      return ListView(
        children: [
          const SizedBox(height: AppSpacing.xl * 3),
          Center(child: Text(context.l10n.comingSoon)),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      itemCount: visible.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.lg),
      itemBuilder: (_, i) => HomeSectionView(section: visible[i]),
    );
  }
}

class _HomeError extends StatelessWidget {
  const _HomeError({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.margin),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.wifi_off_rounded,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.md),
            FilledButton(onPressed: onRetry, child: Text(context.l10n.retry)),
          ],
        ),
      ),
    );
  }
}
