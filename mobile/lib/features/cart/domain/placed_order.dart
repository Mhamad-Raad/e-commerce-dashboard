import '../../../core/money/money.dart';

/// The order returned by `POST /app/cart/checkout` — just what the confirmation
/// screen needs.
class PlacedOrder {
  const PlacedOrder({
    required this.id,
    required this.number,
    required this.totalCents,
    this.currency = 'IQD',
  });

  final String id;
  final String number;
  final int totalCents;
  final String currency;

  Money get total => Money(totalCents, currency: currency);

  factory PlacedOrder.fromJson(Map<String, dynamic> json) => PlacedOrder(
        id: json['id'] as String,
        number: (json['number'] as String?) ?? '',
        totalCents: (json['totalCents'] as num?)?.toInt() ?? 0,
        currency: (json['currency'] as String?) ?? 'IQD',
      );
}
