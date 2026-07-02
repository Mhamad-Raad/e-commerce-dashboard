import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/locale/locale_controller.dart';
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
  NotificationsRepository get _repo =>
      ref.read(notificationsRepositoryProvider);

  String get _lang => ref.read(localeControllerProvider).languageCode;

  @override
  Future<List<AppNotification>> build() async {
    // Re-fetch on language switch so announcement text re-resolves.
    final lang = ref.watch(localeControllerProvider).languageCode;
    return (await _repo.list(lang)).unwrapOrThrow();
  }

  Future<void> refresh() async {
    // Only replace the list on success — a flaky pull-to-refresh must not blank
    // the already-loaded notifications with an error view.
    final result = await _repo.list(_lang);
    if (result case Success(value: final items)) {
      state = AsyncData(items);
      ref.invalidate(unreadCountProvider);
    }
  }

  Future<void> markRead(String id) async {
    final current = state.maybeWhen(data: (v) => v, orElse: () => null);
    if (current == null) return;
    // Optimistic: flip the row locally, then tell the server. copyWith keeps
    // the announcement payload so the content doesn't disappear.
    state = AsyncData([
      for (final n in current)
        if (n.id == id && !n.isRead) n.copyWith(isRead: true) else n,
    ]);
    final result = await _repo.markRead(id);
    if (result case Failed()) {
      state = AsyncData(current); // revert so UI doesn't diverge from server
      return;
    }
    ref.invalidate(unreadCountProvider);
  }

  Future<void> markAllRead() async {
    final current = state.maybeWhen(data: (v) => v, orElse: () => null);
    if (current == null) return;
    state = AsyncData([for (final n in current) n.copyWith(isRead: true)]);
    final result = await _repo.markAllRead();
    if (result case Failed()) {
      state = AsyncData(current); // revert on failure
      return;
    }
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
