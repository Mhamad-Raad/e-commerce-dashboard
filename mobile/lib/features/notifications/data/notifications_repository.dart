import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/dio_client.dart';
import '../domain/app_notification.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>(
  (ref) => NotificationsRepository(ref.watch(dioProvider)),
);

/// All customer notification-centre + push-device calls against `/app/notifications`.
class NotificationsRepository {
  NotificationsRepository(this._dio);
  final Dio _dio;

  Future<Result<List<AppNotification>>> list() async {
    try {
      final res = await _dio.get('/app/notifications');
      // Endpoint returns a paginated { items, total, ... } envelope.
      final raw = res.data is Map ? (res.data['items'] as List? ?? const []) : const [];
      return Success(raw
          .whereType<Map>()
          .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e)))
          .toList());
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<int>> unreadCount() async {
    try {
      final res = await _dio.get('/app/notifications/unread-count');
      final count = res.data is Map ? (res.data['count'] as int? ?? 0) : 0;
      return Success(count);
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<void>> markRead(String id) async {
    try {
      await _dio.patch('/app/notifications/$id/read');
      return const Success(null);
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<void>> markAllRead() async {
    try {
      await _dio.post('/app/notifications/read-all');
      return const Success(null);
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  // ---- Push device registration (used by PushService, not the UI) ----

  Future<void> registerDevice({
    required String token,
    required String platform,
    required String locale,
  }) async {
    await _dio.post('/app/notifications/devices', data: {
      'token': token,
      'platform': platform,
      'locale': locale,
    });
  }

  Future<void> unregisterDevice(String token) async {
    await _dio.delete('/app/notifications/devices', data: {'token': token});
  }
}
