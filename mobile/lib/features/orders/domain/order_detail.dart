import '../../../core/money/money.dart';
import '../../addresses/domain/iraq_geo.dart';

class OrderLineItem {
  const OrderLineItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.priceCents,
    this.variantName,
    this.imageUrl,
    this.currency = 'IQD',
  });

  final String id;
  final String name;
  final int quantity;
  final int priceCents;
  final String? variantName;
  final String? imageUrl;
  final String currency;

  Money get lineTotal => Money(priceCents * quantity, currency: currency);

  factory OrderLineItem.fromJson(Map<String, dynamic> json,
          {String currency = 'IQD'}) =>
      OrderLineItem(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? '',
        quantity: (json['quantity'] as num?)?.toInt() ?? 1,
        priceCents: (json['priceCents'] as num?)?.toInt() ?? 0,
        variantName: json['variantName'] as String?,
        imageUrl: json['imageUrl'] as String?,
        currency: currency,
      );
}

class OrderPayment {
  const OrderPayment({
    required this.method,
    required this.status,
    required this.amountCents,
    this.currency = 'IQD',
  });

  final String method;
  final String status;
  final int amountCents;
  final String currency;

  Money get amount => Money(amountCents, currency: currency);

  factory OrderPayment.fromJson(Map<String, dynamic> json,
          {String currency = 'IQD'}) =>
      OrderPayment(
        method: (json['method'] as String?) ?? '',
        status: (json['status'] as String?) ?? 'PENDING',
        amountCents: (json['amountCents'] as num?)?.toInt() ?? 0,
        currency: currency,
      );
}

/// The shipping-address snapshot taken at order time. Governorate/city are enum
/// names ([humanizeGeo] for display).
class OrderShipping {
  const OrderShipping({
    this.name,
    this.phone,
    this.governorate,
    this.city,
    this.district,
    this.street,
    this.landmark,
  });

  final String? name;
  final String? phone;
  final String? governorate;
  final String? city;
  final String? district;
  final String? street;
  final String? landmark;

  bool get hasAddress => governorate != null && city != null;

  String get summary {
    final parts = <String>[
      if (street != null && street!.isNotEmpty) street!,
      if (district != null && district!.isNotEmpty) district!,
      if (city != null) humanizeGeo(city!),
      if (governorate != null) humanizeGeo(governorate!),
    ];
    return parts.join('، ');
  }

  factory OrderShipping.fromJson(Map<String, dynamic> json) => OrderShipping(
        name: json['name'] as String?,
        phone: json['phone'] as String?,
        governorate: json['governorate'] as String?,
        city: json['city'] as String?,
        district: json['district'] as String?,
        street: json['street'] as String?,
        landmark: json['landmark'] as String?,
      );
}

/// Full order detail (`GET /app/orders/:id`).
class OrderDetail {
  const OrderDetail({
    required this.id,
    required this.number,
    required this.status,
    required this.placedAt,
    required this.subtotalCents,
    required this.discountCents,
    required this.taxCents,
    required this.shippingCents,
    required this.feesCents,
    required this.totalCents,
    required this.ship,
    required this.items,
    required this.payments,
    this.couponCode,
    this.feesLabel,
    this.notes,
    this.trackingNumber,
    this.currency = 'IQD',
  });

  final String id;
  final String number;
  final String status;
  final DateTime placedAt;
  final int subtotalCents;
  final int discountCents;
  final int taxCents;
  final int shippingCents;
  final int feesCents;
  final int totalCents;
  final OrderShipping ship;
  final List<OrderLineItem> items;
  final List<OrderPayment> payments;
  final String? couponCode;
  final String? feesLabel;
  final String? notes;
  final String? trackingNumber;
  final String currency;

  bool get hasDiscount => discountCents > 0;
  bool get hasTax => taxCents > 0;
  bool get hasFees => feesCents > 0;
  bool get hasShipping => shippingCents > 0;

  Money _m(int c) => Money(c, currency: currency);
  Money get subtotal => _m(subtotalCents);
  Money get discount => _m(discountCents);
  Money get tax => _m(taxCents);
  Money get shipping => _m(shippingCents);
  Money get fees => _m(feesCents);
  Money get total => _m(totalCents);

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    final currency = (json['currency'] as String?) ?? 'IQD';
    List<T> parse<T>(dynamic raw, T Function(Map<String, dynamic>) f) =>
        raw is List
            ? raw
                .whereType<Map>()
                .map((e) => f(Map<String, dynamic>.from(e)))
                .toList()
            : <T>[];
    return OrderDetail(
      id: json['id'] as String,
      number: (json['number'] as String?) ?? '',
      status: (json['status'] as String?) ?? 'PENDING',
      placedAt: DateTime.tryParse(json['placedAt'] as String? ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0),
      subtotalCents: (json['subtotalCents'] as num?)?.toInt() ?? 0,
      discountCents: (json['discountCents'] as num?)?.toInt() ?? 0,
      taxCents: (json['taxCents'] as num?)?.toInt() ?? 0,
      shippingCents: (json['shippingCents'] as num?)?.toInt() ?? 0,
      feesCents: (json['feesCents'] as num?)?.toInt() ?? 0,
      totalCents: (json['totalCents'] as num?)?.toInt() ?? 0,
      couponCode: json['couponCode'] as String?,
      feesLabel: json['feesLabel'] as String?,
      notes: json['notes'] as String?,
      trackingNumber: json['trackingNumber'] as String?,
      currency: currency,
      ship: OrderShipping.fromJson(
          json['ship'] is Map ? Map<String, dynamic>.from(json['ship']) : {}),
      items: parse(json['items'],
          (m) => OrderLineItem.fromJson(m, currency: currency)),
      payments: parse(json['payments'],
          (m) => OrderPayment.fromJson(m, currency: currency)),
    );
  }
}
