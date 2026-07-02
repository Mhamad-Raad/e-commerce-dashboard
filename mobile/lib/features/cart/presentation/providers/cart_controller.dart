import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../../data/cart_repository.dart';
import '../../domain/cart.dart';
import '../../domain/cart_quote.dart';
import '../../domain/placed_order.dart';

/// The customer's open cart. Mutations return a [Result] (so screens can surface
/// failures) and push the server's returned cart straight into [state] — no
/// separate refetch needed since every cart endpoint returns the updated cart.
final cartControllerProvider =
    AsyncNotifierProvider<CartController, Cart>(CartController.new);

/// §selection — selection lives app-side only (spec'd with the user 2026-07-02):
/// we track the DEselected ids so new items default to selected without any
/// bookkeeping, and stale ids (removed items) are harmless. Checkout/preview
/// send the selected ids; the server orders only those and keeps the rest.
final cartDeselectedProvider =
    NotifierProvider<IdSetNotifier, Set<String>>(IdSetNotifier.new);

/// Item ids with an in-flight qty/remove mutation — drives the per-row loader
/// and disables that row's controls (serialises rapid taps, like Akkooo).
final cartItemBusyProvider =
    NotifierProvider<IdSetNotifier, Set<String>>(IdSetNotifier.new);

/// Optimistic delete: ids hidden from the list while their DELETE round-trips.
/// On failure the id is dropped and the row reappears.
final cartPendingDeleteProvider =
    NotifierProvider<IdSetNotifier, Set<String>>(IdSetNotifier.new);

class IdSetNotifier extends Notifier<Set<String>> {
  @override
  Set<String> build() => {};

  void add(String id) => state = {...state, id};
  void remove(String id) => state = {...state}..remove(id);
  void toggle(String id) => state.contains(id) ? remove(id) : add(id);
  void addAll(Iterable<String> ids) => state = {...state, ...ids};
  void removeAll(Iterable<String> ids) => state = {...state}..removeAll(ids);
  void clear() => state = {};
}

class CartController extends AsyncNotifier<Cart> {
  CartRepository get _repo => ref.read(cartRepositoryProvider);

  @override
  Future<Cart> build() async => (await _repo.getCart()).unwrapOrThrow();

  Future<Result<Cart>> addProduct(String productId,
      {String? variantId, int quantity = 1}) async {
    final result = await _repo.addItem(productId,
        variantId: variantId, quantity: quantity);
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<Cart>> setQuantity(String itemId, int quantity) async {
    final busy = ref.read(cartItemBusyProvider.notifier);
    busy.add(itemId);
    try {
      final result = await _repo.updateItem(itemId, quantity);
      _applyIfSuccess(result);
      return result;
    } finally {
      busy.remove(itemId);
    }
  }

  Future<Result<Cart>> removeItem(String itemId) async {
    final pending = ref.read(cartPendingDeleteProvider.notifier);
    pending.add(itemId); // hide the row immediately (optimistic)
    try {
      final result = await _repo.removeItem(itemId);
      _applyIfSuccess(result);
      return result;
    } finally {
      pending.remove(itemId);
    }
  }

  Future<Result<Cart>> applyCoupon(String code) async {
    final result = await _repo.applyCoupon(code);
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<Cart>> removeCoupon() async {
    final result = await _repo.removeCoupon();
    _applyIfSuccess(result);
    return result;
  }

  Future<Result<PlacedOrder>> checkout({
    required String addressId,
    required String paymentMethod,
    String? notes,
    List<String>? itemIds,
  }) async {
    final result = await _repo.checkout(
      addressId: addressId,
      paymentMethod: paymentMethod,
      notes: notes,
      itemIds: itemIds,
    );
    // Ordered items are gone; whatever the server kept starts fresh-selected.
    if (result is Success<PlacedOrder>) {
      ref.read(cartDeselectedProvider.notifier).clear();
    }
    // Reload the cart either way: success consumed it (fresh empty open cart);
    // failure means the server rejected it (out of stock / invalid coupon /
    // inactive product), so show the current state instead of the stale cart.
    state = await AsyncValue.guard(() async => (await _repo.getCart()).unwrapOrThrow());
    return result;
  }

  void _applyIfSuccess(Result<Cart> result) {
    if (result case Success<Cart>(value: final cart)) {
      state = AsyncData(cart);
    }
  }
}

/// Item count for the app-bar cart badge (0 while loading/empty).
final cartCountProvider = Provider<int>((ref) {
  return ref.watch(cartControllerProvider).maybeWhen(
        data: (cart) => cart.itemCount,
        orElse: () => 0,
      );
});

/// Items shown in the list: the cart minus optimistically-deleted rows.
final cartVisibleItemsProvider = Provider<List<CartItem>>((ref) {
  final cart = ref.watch(cartControllerProvider).asData?.value;
  if (cart == null) return const [];
  final pending = ref.watch(cartPendingDeleteProvider);
  if (pending.isEmpty) return cart.items;
  return [for (final i in cart.items) if (!pending.contains(i.id)) i];
});

/// Visible items the user has left selected — what checkout will order.
final cartSelectedItemsProvider = Provider<List<CartItem>>((ref) {
  final items = ref.watch(cartVisibleItemsProvider);
  final deselected = ref.watch(cartDeselectedProvider);
  if (deselected.isEmpty) return items;
  return [for (final i in items) if (!deselected.contains(i.id)) i];
});

/// Selected item ids to send to preview/checkout, or null when the whole cart
/// is selected (server treats "omitted" as "everything").
final cartSelectedIdsProvider = Provider<List<String>?>((ref) {
  final visible = ref.watch(cartVisibleItemsProvider);
  final selected = ref.watch(cartSelectedItemsProvider);
  if (selected.length == visible.length) return null;
  return [for (final i in selected) i.id];
});

/// The checkout money breakdown for the SELECTED items. Re-fetches whenever the
/// cart or the selection changes so the review screen always shows the live total.
final cartQuoteProvider = FutureProvider.autoDispose<CartQuote>((ref) async {
  ref.watch(cartControllerProvider);
  final itemIds = ref.watch(cartSelectedIdsProvider);
  final result =
      await ref.watch(cartRepositoryProvider).getPreview(itemIds: itemIds);
  return result.unwrapOrThrow();
});
