import '../../../core/money/money.dart';

/// A line in the cart. `priceCents` is whole dinars (the snapshot taken when the
/// item was added), `name`/`imageUrl` come from the resolved product.
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
  });

  final String id;
  final String productId;
  final String name;
  final int quantity;
  final int priceCents;
  final String? variantName;
  final String? imageUrl;
  final String currency;

  Money get unitPrice => Money(priceCents, currency: currency);
  Money get lineTotal => Money(priceCents * quantity, currency: currency);

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final product = json['product'];
    return CartItem(
      id: json['id'] as String,
      productId: json['productId'] as String,
      name: product is Map ? (product['name'] as String? ?? '') : '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      priceCents: (json['priceCents'] as num?)?.toInt() ?? 0,
      variantName: json['variantName'] as String?,
      imageUrl: product is Map ? product['imageUrl'] as String? : null,
    );
  }
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
