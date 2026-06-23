import '../../../core/money/money.dart';

/// The money breakdown for the cart at checkout (`GET /app/cart/preview`).
/// Tax + fees are resolved server-side from fee groups; shipping is 0 in v1.
class CartQuote {
  const CartQuote({
    required this.subtotalCents,
    required this.discountCents,
    required this.taxCents,
    required this.shippingCents,
    required this.feesCents,
    required this.totalCents,
    this.couponCode,
    this.feesLabel,
    this.currency = 'IQD',
  });

  final int subtotalCents;
  final int discountCents;
  final int taxCents;
  final int shippingCents;
  final int feesCents;
  final int totalCents;
  final String? couponCode;
  final String? feesLabel;
  final String currency;

  bool get hasDiscount => discountCents > 0;
  bool get hasTax => taxCents > 0;
  bool get hasFees => feesCents > 0;
  bool get hasShipping => shippingCents > 0;

  Money _m(int cents) => Money(cents, currency: currency);
  Money get subtotal => _m(subtotalCents);
  Money get discount => _m(discountCents);
  Money get tax => _m(taxCents);
  Money get shipping => _m(shippingCents);
  Money get fees => _m(feesCents);
  Money get total => _m(totalCents);

  factory CartQuote.fromJson(Map<String, dynamic> json) => CartQuote(
        subtotalCents: (json['subtotalCents'] as num?)?.toInt() ?? 0,
        discountCents: (json['discountCents'] as num?)?.toInt() ?? 0,
        taxCents: (json['taxCents'] as num?)?.toInt() ?? 0,
        shippingCents: (json['shippingCents'] as num?)?.toInt() ?? 0,
        feesCents: (json['feesCents'] as num?)?.toInt() ?? 0,
        totalCents: (json['totalCents'] as num?)?.toInt() ?? 0,
        couponCode: json['couponCode'] as String?,
        feesLabel: json['feesLabel'] as String?,
        currency: (json['currency'] as String?) ?? 'IQD',
      );
}
