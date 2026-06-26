import 'dart:convert';
import 'dart:io' show Platform;

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale/locale_controller.dart';
import '../../../app/router/app_router.dart';
import '../../../app/router/routes.dart';
import '../../../core/push/push_messaging.dart';
import '../../auth/presentation/providers/auth_controller.dart';
import 'notifications_repository.dart';
import '../presentation/notification_target_nav.dart';
import '../presentation/providers/notifications_controller.dart';

final pushServiceProvider = Provider<PushService>((ref) => PushService(ref));

/// Drives the FCM lifecycle: requests permission, registers the device token
/// with the backend on login, refreshes it on rotation, unregisters on logout,
/// displays foreground messages, and deep-links notification taps to the order.
///
/// Entirely inert when [firebaseReady] is false (no native Firebase config yet)
/// so the app runs identically before any Firebase project exists.
class PushService {
  PushService(this._ref);
  final Ref _ref;

  final _local = FlutterLocalNotificationsPlugin();
  bool _handlersReady = false;

  static const _channel = AndroidNotificationChannel(
    'order_updates',
    'Order updates',
    description: 'Notifications about your orders',
    importance: Importance.high,
  );

  /// Called when the authenticated shell mounts (i.e. on every login). Sets up
  /// message handlers once, then registers the current token.
  Future<void> onAuthenticated() async {
    if (!firebaseReady) return;
    await _ensureHandlers();
    await _registerToken();
  }

  /// Called from logout BEFORE the auth token is cleared, so the unregister
  /// request is still authenticated. Drops this device server-side.
  Future<void> onLogout() async {
    if (!firebaseReady) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) {
        await _ref
            .read(notificationsRepositoryProvider)
            .unregisterDevice(token);
      }
    } catch (e) {
      debugPrint('FCM unregister failed: $e');
    }
  }

  Future<void> _ensureHandlers() async {
    if (_handlersReady) return;
    _handlersReady = true;

    // Ask for permission (Android 13+ prompt / iOS prompt).
    await FirebaseMessaging.instance.requestPermission();

    // Local-notification channel used to surface FOREGROUND messages (the OS
    // shows background ones itself).
    await _local.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
      onDidReceiveNotificationResponse: (resp) =>
          _routeFromPayload(resp.payload),
    );
    await _local
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(_channel);

    // Foreground: draw the message ourselves + refresh badge/list.
    FirebaseMessaging.onMessage.listen(_onForegroundMessage);
    // Tapped while backgrounded → deep-link.
    FirebaseMessaging.onMessageOpenedApp.listen((m) => _routeFromData(m.data));
    // Re-register whenever Firebase rotates the token (only while logged in).
    FirebaseMessaging.instance.onTokenRefresh.listen((_) {
      if (_ref.read(authControllerProvider).isLoggedIn) _registerToken();
    });

    // Cold start from a notification tap.
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) _routeFromData(initial.data);
  }

  Future<void> _registerToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;
      final locale = _ref.read(localeControllerProvider).languageCode;
      final platform = Platform.isIOS
          ? 'IOS'
          : Platform.isAndroid
          ? 'ANDROID'
          : 'WEB';
      await _ref
          .read(notificationsRepositoryProvider)
          .registerDevice(token: token, platform: platform, locale: locale);
    } catch (e) {
      debugPrint('FCM register failed: $e');
    }
  }

  void _onForegroundMessage(RemoteMessage message) {
    // Keep the badge + centre live without waiting for the next screen open.
    _ref.invalidate(unreadCountProvider);
    _ref.read(notificationsControllerProvider.notifier).refresh();

    final n = message.notification;
    if (n == null) return; // data-only message — nothing to display
    _local.show(
      id: n.hashCode,
      title: n.title,
      body: n.body,
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: const DarwinNotificationDetails(),
      ),
      payload: jsonEncode(message.data),
    );
  }

  void _routeFromPayload(String? payload) {
    if (payload == null || payload.isEmpty) return;
    try {
      final data = jsonDecode(payload);
      if (data is Map) _routeFromData(Map<String, dynamic>.from(data));
    } catch (_) {
      // ignore malformed payloads
    }
  }

  void _routeFromData(Map<String, dynamic> data) {
    final router = _ref.read(appRouterProvider);
    final orderId = data['orderId'];
    if (orderId is String && orderId.isNotEmpty) {
      router.push(Routes.orderDetail(orderId));
      return;
    }
    // Announcement tap: route to its target if deep-linkable, else the centre.
    final route = notificationTargetRoute(
      data['targetType'] as String?,
      data['targetId'] as String?,
      data['url'] as String?,
    );
    router.push(route ?? Routes.notifications);
  }
}
