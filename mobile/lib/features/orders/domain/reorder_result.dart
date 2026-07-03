/// Result of `POST /app/orders/:id/reorder`.
class ReorderResult {
  const ReorderResult({
    required this.cartId,
    required this.added,
    required this.skipped,
  });

  final String cartId;
  final int added;
  final List<ReorderSkippedItem> skipped;

  factory ReorderResult.fromJson(Map<String, dynamic> json) => ReorderResult(
        cartId: (json['cartId'] as String?) ?? '',
        added: (json['added'] as num?)?.toInt() ?? 0,
        skipped: json['skipped'] is List
            ? (json['skipped'] as List)
                .whereType<Map>()
                .map((e) =>
                    ReorderSkippedItem.fromJson(Map<String, dynamic>.from(e)))
                .toList()
            : const [],
      );
}

class ReorderSkippedItem {
  const ReorderSkippedItem({required this.name, required this.reason});

  final String name;
  final String reason; // 'unavailable' | 'out_of_stock'

  bool get outOfStock => reason == 'out_of_stock';

  factory ReorderSkippedItem.fromJson(Map<String, dynamic> json) =>
      ReorderSkippedItem(
        name: (json['name'] as String?) ?? '',
        reason: (json['reason'] as String?) ?? 'unavailable',
      );
}
