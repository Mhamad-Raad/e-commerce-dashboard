import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../../data/notifications_repository.dart';
import '../../domain/app_notification.dart';

/// The customer's notification list (newest first). Mark-read mutations update
/// state in place and refresh the unread badge.
final notificationsControllerProvider =
    AsyncNotifierProvider<NotificationsController, List<AppNotification>>(
  NotificationsController.new,
);

class NotificationsController extends AsyncNotifier<List<AppNotification>> {
  NotificationsRepository get _repo => ref.read(notificationsRepositoryProvider);

  @override
  Future<List<AppNotification>> build() async =>
      (await _repo.list()).unwrapOrThrow();

  Future<void> refresh() async {
    state = await AsyncValue.guard(() async => (await _repo.list()).unwrapOrThrow());
    ref.invalidate(unreadCountProvider);
  }

  Future<void> markRead(String id) async {
    final current = state.maybeWhen(data: (v) => v, orElse: () => null);
    if (current == null) return;
    // Optimistic: flip the row locally, then tell the server.
    state = AsyncData([
      for (final n in current)
        if (n.id == id && !n.isRead)
          AppNotification(
            id: n.id,
            type: n.type,
            data: n.data,
            isRead: true,
            createdAt: n.createdAt,
          )
        else
          n,
    ]);
    await _repo.markRead(id);
    ref.invalidate(unreadCountProvider);
  }

  Future<void> markAllRead() async {
    final current = state.maybeWhen(data: (v) => v, orElse: () => null);
    if (current != null) {
      state = AsyncData([
        for (final n in current)
          AppNotification(
            id: n.id,
            type: n.type,
            data: n.data,
            isRead: true,
            createdAt: n.createdAt,
          ),
      ]);
    }
    await _repo.markAllRead();
    ref.invalidate(unreadCountProvider);
  }
}

/// Unread count for the app-bar bell badge. Kept alive (not autoDispose) so the
/// badge survives navigation; invalidated on mark-read and on a foreground push.
final unreadCountProvider = FutureProvider<int>((ref) async {
  final result = await ref.watch(notificationsRepositoryProvider).unreadCount();
  return switch (result) {
    Success(value: final count) => count,
    Failed() => 0, // a failed count must never block the UI — show no badge
  };
});
