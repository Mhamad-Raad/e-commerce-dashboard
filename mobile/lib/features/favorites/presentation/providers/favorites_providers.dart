import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/locale/locale_controller.dart';
import '../../../../core/network/api_result.dart';
import '../../../catalog/domain/catalog_product.dart';
import '../../data/favorites_repository.dart';

/// The set of favorited product ids — the source of truth for heart icons across
/// the app. Toggling is optimistic (instant heart) and reverts on failure.
final favoriteIdsProvider =
    NotifierProvider<FavoriteIds, Set<String>>(FavoriteIds.new);

class FavoriteIds extends Notifier<Set<String>> {
  @override
  Set<String> build() {
    _load();
    return const {};
  }

  FavoritesRepository get _repo => ref.read(favoritesRepositoryProvider);

  Future<void> _load() async {
    final lang = ref.read(localeControllerProvider).languageCode;
    final result = await _repo.list(lang);
    if (result case Success(value: final products)) {
      state = products.map((p) => p.id).toSet();
    }
  }

  bool contains(String productId) => state.contains(productId);

  /// Flip a product's favorite state. Returns the [Result] so the caller can
  /// surface a failure; the optimistic change is reverted on error.
  Future<Result<void>> toggle(String productId) async {
    final wasFavorite = state.contains(productId);
    state = wasFavorite
        ? ({...state}..remove(productId))
        : ({...state}..add(productId));

    final result =
        wasFavorite ? await _repo.remove(productId) : await _repo.add(productId);

    switch (result) {
      case Success():
        ref.invalidate(favoritesListProvider);
      case Failed():
        // Revert the optimistic change.
        state = wasFavorite
            ? ({...state}..add(productId))
            : ({...state}..remove(productId));
    }
    return result;
  }
}

/// The full favorite products, for the Favorites screen. Re-fetches on locale
/// change and whenever the favorites set is toggled.
final favoritesListProvider =
    FutureProvider.autoDispose<List<CatalogProduct>>((ref) async {
  final lang = ref.watch(localeControllerProvider).languageCode;
  final result = await ref.watch(favoritesRepositoryProvider).list(lang);
  return result.unwrapOrThrow();
});
