/// A customer notification from the in-app notification centre. Stores only the
/// [type] + structured [data]; the human-readable title/body are rendered
/// client-side (see notification_presentation.dart) so the same row reads
/// correctly in whatever language the app is currently set to.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.type,
    required this.data,
    required this.isRead,
    required this.createdAt,
  });

  final String id;
  final String type; // ORDER_PLACED | ORDER_STATUS_CHANGED
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime createdAt;

  /// Convenience: the order this notification points at, if any.
  String? get orderId => data['orderId'] as String?;

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final rawData = json['data'];
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      data: rawData is Map ? Map<String, dynamic>.from(rawData) : const {},
      isRead: json['isRead'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
