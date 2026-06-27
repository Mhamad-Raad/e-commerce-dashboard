/// A customer notification from the in-app notification centre. Order rows store
/// only [type] + structured [data] (text rendered client-side from the app's
/// current language); ANNOUNCEMENT rows additionally carry [announcement] — the
/// admin-authored title/body/image + tap target, already resolved by `?lang`.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.type,
    required this.data,
    required this.isRead,
    required this.createdAt,
    this.announcement,
  });

  final String id;
  final String type; // ORDER_PLACED | ORDER_STATUS_CHANGED | ANNOUNCEMENT
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime createdAt;
  final NotificationAnnouncement? announcement;

  /// Convenience: the order this notification points at, if any.
  String? get orderId => data['orderId'] as String?;

  /// Copy with overrides — preserves [announcement] etc. so optimistic
  /// read-state flips don't drop the row's content.
  AppNotification copyWith({bool? isRead}) => AppNotification(
        id: id,
        type: type,
        data: data,
        isRead: isRead ?? this.isRead,
        createdAt: createdAt,
        announcement: announcement,
      );

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    final rawData = json['data'];
    final rawAnn = json['announcement'];
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      data: rawData is Map ? Map<String, dynamic>.from(rawData) : const {},
      isRead: json['isRead'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      announcement: rawAnn is Map
          ? NotificationAnnouncement.fromJson(Map<String, dynamic>.from(rawAnn))
          : null,
    );
  }
}

/// The admin-authored content of an ANNOUNCEMENT notification. Title/body are
/// already resolved to the requested language by the server; the target is a
/// tappable deep-link (reuses HomeTargetType semantics).
class NotificationAnnouncement {
  const NotificationAnnouncement({
    this.title,
    this.body,
    this.imageUrl,
    this.targetType,
    this.targetId,
    this.url,
  });

  final String? title;
  final String? body;
  final String? imageUrl;
  final String? targetType; // NONE | PRODUCT | CATEGORY | STORE | BLOG | URL
  final String? targetId;
  final String? url;

  factory NotificationAnnouncement.fromJson(Map<String, dynamic> json) =>
      NotificationAnnouncement(
        title: json['title'] as String?,
        body: json['body'] as String?,
        imageUrl: json['imageUrl'] as String?,
        targetType: json['targetType'] as String?,
        targetId: json['targetId'] as String?,
        url: json['url'] as String?,
      );
}
