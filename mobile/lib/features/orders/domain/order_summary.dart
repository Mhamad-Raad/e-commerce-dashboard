import '../../../core/money/money.dart';

/// A row in the order history list (`GET /app/orders`).
class OrderSummary {
  const OrderSummary({
    required this.id,
    required this.number,
    required this.status,
    required this.placedAt,
    required this.totalCents,
    required this.itemCount,
    this.currency = 'IQD',
  });

  final String id;
  final String number;
  final String status;
  final DateTime placedAt;
  final int totalCents;
  final int itemCount;
  final String currency;

  Money get total => Money(totalCents, currency: currency);

  factory OrderSummary.fromJson(Map<String, dynamic> json) => OrderSummary(
        id: json['id'] as String,
        number: (json['number'] as String?) ?? '',
        status: (json['status'] as String?) ?? 'PENDING',
        placedAt: DateTime.tryParse(json['placedAt'] as String? ?? '') ??
            DateTime.fromMillisecondsSinceEpoch(0),
        totalCents: (json['totalCents'] as num?)?.toInt() ?? 0,
        itemCount: (json['itemCount'] as num?)?.toInt() ?? 0,
        currency: (json['currency'] as String?) ?? 'IQD',
      );
}
