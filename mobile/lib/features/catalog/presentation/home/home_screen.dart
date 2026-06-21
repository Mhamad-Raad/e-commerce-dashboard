import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_sizes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';
import '../../data/home_repository.dart';
import '../../domain/home_data.dart';
import 'widgets/category_avatar.dart';
import 'widgets/hero_carousel.dart';
import 'widgets/product_card.dart';
import 'widgets/section_header.dart';

/// Storefront landing: hero banners, featured categories, featured products.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final home = ref.watch(homeProvider);
    return Scaffold(
      appBar: const RozhnaAppBar(showCart: true),
      body: home.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _HomeError(
          message: error is Failure ? error.message : context.l10n.homeLoadError,
          onRetry: () => ref.invalidate(homeProvider),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(homeProvider);
            await ref.read(homeProvider.future);
          },
          child: _HomeBody(data: data),
        ),
      ),
    );
  }
}

class _HomeBody extends StatelessWidget {
  const _HomeBody({required this.data});

  final HomeData data;

  @override
  Widget build(BuildContext context) {
    final isEmpty = data.banners.isEmpty &&
        data.featuredCategories.isEmpty &&
        data.featuredProducts.isEmpty;

    if (isEmpty) {
      // Keep it scrollable so pull-to-refresh still works.
      return ListView(
        children: [
          const SizedBox(height: AppSpacing.xl * 3),
          Center(child: Text(context.l10n.comingSoon)),
        ],
      );
    }

    return CustomScrollView(
      slivers: [
        if (data.banners.isNotEmpty)
          SliverPadding(
            padding: const EdgeInsets.only(top: AppSpacing.md),
            sliver: SliverToBoxAdapter(child: HeroCarousel(banners: data.banners)),
          ),
        if (data.featuredCategories.isNotEmpty) ...[
          SliverToBoxAdapter(child: SectionHeader(title: context.l10n.categoriesTitle)),
          SliverToBoxAdapter(
            child: SizedBox(
              height: AppSizes.categoryAvatar + AppSpacing.xl + AppSpacing.sm,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.margin),
                itemCount: data.featuredCategories.length,
                separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                itemBuilder: (_, i) =>
                    CategoryAvatar(category: data.featuredCategories[i]),
              ),
            ),
          ),
        ],
        if (data.featuredProducts.isNotEmpty) ...[
          SliverToBoxAdapter(child: SectionHeader(title: context.l10n.featuredTitle)),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.margin,
              0,
              AppSpacing.margin,
              AppSpacing.lg,
            ),
            sliver: SliverGrid.builder(
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: AppSizes.productCardMaxWidth,
                mainAxisSpacing: AppSpacing.gutter,
                crossAxisSpacing: AppSpacing.gutter,
                childAspectRatio: 0.62,
              ),
              itemCount: data.featuredProducts.length,
              itemBuilder: (_, i) =>
                  ProductCard(product: data.featuredProducts[i]),
            ),
          ),
        ],
      ],
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
