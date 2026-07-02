import '../../../core/money/money.dart';

/// A line in the cart. `priceCents` is whole dinars (the snapshot taken when the
/// item was added), `name`/`imageUrl` come from the resolved product. Store +
/// lead-days let the cart group items per store and show an arrival estimate
/// (product override, else store default).
class CartItem {
  const CartItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.quantity,
    required this.priceCents,
    this.variantName,
    this.imageUrl,
    this.currency = 'IQD',
    this.storeId = '',
    this.storeName = '',
    this.minLeadDays = 3,
    this.maxLeadDays = 7,
  });

  final String id;
  final String productId;
  final String name;
  final int quantity;
  final int priceCents;
  final String? variantName;
  final String? imageUrl;
  final String currency;
  final String storeId;
  final String storeName;
  final int minLeadDays;
  final int maxLeadDays;

  Money get unitPrice => Money(priceCents, currency: currency);
  Money get lineTotal => Money(priceCents * quantity, currency: currency);

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final product = json['product'];
    final store = product is Map ? product['store'] : null;
    final storeMin =
        store is Map ? (store['minLeadDays'] as num?)?.toInt() : null;
    final storeMax =
        store is Map ? (store['maxLeadDays'] as num?)?.toInt() : null;
    return CartItem(
      id: json['id'] as String,
      productId: json['productId'] as String,
      name: product is Map ? (product['name'] as String? ?? '') : '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      priceCents: (json['priceCents'] as num?)?.toInt() ?? 0,
      variantName: json['variantName'] as String?,
      imageUrl: product is Map ? product['imageUrl'] as String? : null,
      storeId: store is Map ? (store['id'] as String? ?? '') : '',
      storeName: store is Map ? (store['name'] as String? ?? '') : '',
      minLeadDays: (product is Map
              ? (product['minLeadDays'] as num?)?.toInt()
              : null) ??
          storeMin ??
          3,
      maxLeadDays: (product is Map
              ? (product['maxLeadDays'] as num?)?.toInt()
              : null) ??
          storeMax ??
          7,
    );
  }
}

/// Cart items of one store, in cart order. The arrival window is the widest
/// span across the group's items (earliest min → latest max).
class CartStoreGroup {
  const CartStoreGroup({
    required this.storeId,
    required this.storeName,
    required this.items,
  });

  final String storeId;
  final String storeName;
  final List<CartItem> items;

  int get minLeadDays =>
      items.fold(items.first.minLeadDays, (m, i) => i.minLeadDays < m ? i.minLeadDays : m);
  int get maxLeadDays =>
      items.fold(items.first.maxLeadDays, (m, i) => i.maxLeadDays > m ? i.maxLeadDays : m);
}

/// Group items per store, preserving first-appearance order.
List<CartStoreGroup> groupItemsByStore(List<CartItem> items) {
  final byStore = <String, List<CartItem>>{};
  for (final item in items) {
    byStore.putIfAbsent(item.storeId, () => []).add(item);
  }
  return [
    for (final entry in byStore.entries)
      CartStoreGroup(
        storeId: entry.key,
        storeName: entry.value.first.storeName,
        items: entry.value,
      ),
  ];
}

/// The customer's open cart (`GET /app/cart`). Tax/fees aren't known here — they
/// are resolved at checkout via the preview endpoint.
class Cart {
  const Cart({
    required this.id,
    required this.items,
    this.discountCents = 0,
    this.couponCode,
  });

  final String id;
  final List<CartItem> items;
  final int discountCents;
  final String? couponCode;

  int get itemCount => items.fold(0, (sum, i) => sum + i.quantity);
  bool get isEmpty => items.isEmpty;

  int get subtotalCents =>
      items.fold(0, (sum, i) => sum + i.priceCents * i.quantity);

  Money get subtotal => Money(subtotalCents);
  Money get discount => Money(discountCents);

  factory Cart.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final coupon = json['coupon'];
    return Cart(
      id: json['id'] as String,
      discountCents: (json['discountCents'] as num?)?.toInt() ?? 0,
      couponCode: coupon is Map ? coupon['code'] as String? : null,
      items: rawItems is List
          ? rawItems
              .whereType<Map>()
              .map((e) => CartItem.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : const [],
    );
  }
}
