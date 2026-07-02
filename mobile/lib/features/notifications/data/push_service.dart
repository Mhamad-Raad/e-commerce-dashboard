import 'dart:convert';
import 'dart:io' show HttpClient, Platform;

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timezone/data/latest_10y.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

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
/// displays foreground messages, and deep-links notification taps to their
/// target (order detail, or an announcement's product/store/blog).
///
/// Entirely inert when [firebaseReady] is false (no native Firebase config yet)
/// so the app runs identically before any Firebase project exists.
class PushService {
  PushService(this._ref);
  final Ref _ref;

  final _local = FlutterLocalNotificationsPlugin();
  bool _handlersReady = false;
  bool _localReady = false;

  // One general channel for every push (order updates AND admin announcements);
  // its name is what users see in Android notification settings.
  static const _channel = AndroidNotificationChannel(
    'rozhna_general',
    'Notifications',
    description: 'Order updates, announcements, and more.',
    importance: Importance.high,
  );

  // Separate channel for the daily, phone-scheduled skincare-routine reminder so
  // users can silence it independently of order/announcement pushes.
  static const _routineChannel = AndroidNotificationChannel(
    'rozhna_routine',
    'Routine reminders',
    description: 'Daily reminder to do your skincare routine.',
    importance: Importance.defaultImportance,
  );

  // Stable id so re-scheduling replaces (rather than stacks) the daily reminder.
  static const _routineNotifId = 1001;
  // Evening default — when skincare routines typically happen. Fixed for now;
  // a user-configurable time in Profile is a planned follow-up.
  static const _routineHour = 20;
  static const _routineMinute = 0;

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
    // Stop the personal routine reminder for the signed-out user. Runs even when
    // Firebase is dormant, since the reminder doesn't depend on it.
    await cancelRoutineReminder();
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

  /// (Re)schedule the daily skincare-routine reminder at the evening default in
  /// the customer's local (Baghdad) time. Idempotent — a stable id means a
  /// re-schedule replaces the previous one, and passing the localized strings on
  /// each login lets a language change take effect on the next run.
  Future<void> scheduleDailyRoutineReminder({
    required String title,
    required String body,
  }) async {
    try {
      await _ensureLocalInit();
      await _requestLocalPermission();
      await _local.zonedSchedule(
        id: _routineNotifId,
        scheduledDate: _nextRoutineTime(),
        title: title,
        body: body,
        notificationDetails: NotificationDetails(
          android: AndroidNotificationDetails(
            _routineChannel.id,
            _routineChannel.name,
            channelDescription: _routineChannel.description,
            importance: Importance.defaultImportance,
            priority: Priority.defaultPriority,
          ),
          // Present in the foreground too (iOS shows nothing by default),
          // matching Android which displays regardless of app state.
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBanner: true,
            presentList: true,
            presentSound: true,
          ),
        ),
        // Inexact avoids the SCHEDULE_EXACT_ALARM permission — a daily nudge
        // doesn't need to-the-minute accuracy.
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        // Repeat every day at the same wall-clock time.
        matchDateTimeComponents: DateTimeComponents.time,
        payload: jsonEncode({'routineReminder': '1'}),
      );
    } catch (e) {
      debugPrint('routine reminder schedule failed: $e');
    }
  }

  Future<void> cancelRoutineReminder() async {
    try {
      await _local.cancel(id: _routineNotifId);
    } catch (e) {
      debugPrint('routine reminder cancel failed: $e');
    }
  }

  /// The next occurrence of the reminder time today, or tomorrow if it's passed.
  tz.TZDateTime _nextRoutineTime() {
    final now = tz.TZDateTime.now(tz.local);
    var next = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      _routineHour,
      _routineMinute,
    );
    if (!next.isAfter(now)) next = next.add(const Duration(days: 1));
    return next;
  }

  /// Request notification permission via the local plugin (Android 13+ / iOS).
  /// FCM also requests it, but the reminder must work even when push is dormant.
  Future<void> _requestLocalPermission() async {
    await _local
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.requestNotificationsPermission();
    await _local
        .resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin
        >()
        ?.requestPermissions(alert: true, badge: true, sound: true);
  }

  /// One-time init of the local-notifications plugin, timezone DB, and channels.
  /// Independent of Firebase so the daily routine reminder works even before any
  /// native Firebase config exists. Safe to call repeatedly.
  Future<void> _ensureLocalInit() async {
    if (_localReady) return;

    // Timezone DB is required to build TZDateTime for zonedSchedule. This is an
    // Iraq-market app (numbers are +964), so anchor the daily reminder to
    // Baghdad wall-clock — correct for the vast majority of users, no extra
    // device-timezone plugin needed. (A traveller would get 20:00 Baghdad time.)
    tz_data.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Baghdad'));

    await _local.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
      onDidReceiveNotificationResponse: (resp) =>
          _routeFromPayload(resp.payload),
    );
    final android = _local
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    await android?.createNotificationChannel(_channel);
    await android?.createNotificationChannel(_routineChannel);

    // Latch only after init actually succeeds — if any step above throws, a
    // later call retries instead of silently skipping init for the session.
    _localReady = true;

    // Cold start from tapping a local notification (e.g. the routine reminder):
    // the tap callback above only fires while the app is alive, so route the
    // launch payload here. Safe — init only runs once the authenticated shell is
    // mounted, so the router is ready.
    final launch = await _local.getNotificationAppLaunchDetails();
    if (launch?.didNotificationLaunchApp ?? false) {
      _routeFromPayload(launch!.notificationResponse?.payload);
    }
  }

  Future<void> _ensureHandlers() async {
    if (_handlersReady) return;
    _handlersReady = true;

    // Ask for permission (Android 13+ prompt / iOS prompt).
    await FirebaseMessaging.instance.requestPermission();

    // Local-notification plugin/channels used to surface FOREGROUND messages
    // (the OS shows background ones itself).
    await _ensureLocalInit();

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

  Future<void> _onForegroundMessage(RemoteMessage message) async {
    // Keep the centre + badge live without waiting for the next screen open.
    // refresh() also invalidates unreadCountProvider, so don't double-invalidate.
    _ref.read(notificationsControllerProvider.notifier).refresh();

    final n = message.notification;
    if (n == null) return; // data-only message — nothing to display

    // The OS auto-renders the image when backgrounded; in the foreground WE draw
    // the notification, so fetch the image and use a big-picture style to match.
    final imageUrl = n.android?.imageUrl ?? n.apple?.imageUrl;
    StyleInformation? style;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      final bytes = await _downloadBytes(imageUrl);
      if (bytes != null) {
        style = BigPictureStyleInformation(
          ByteArrayAndroidBitmap(bytes),
          contentTitle: n.title,
          summaryText: n.body,
        );
      }
    }

    await _local.show(
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
          styleInformation: style,
        ),
        iOS: const DarwinNotificationDetails(),
      ),
      payload: jsonEncode(message.data),
    );
  }

  /// Fetch image bytes for a foreground big-picture notification. Returns null
  /// on any failure (the notification then just shows as text).
  Future<Uint8List?> _downloadBytes(String url) async {
    final client = HttpClient();
    try {
      final resp = await (await client.getUrl(Uri.parse(url))).close();
      if (resp.statusCode != 200) return null;
      return await consolidateHttpClientResponseBytes(resp);
    } catch (e) {
      debugPrint('notif image download failed: $e');
      return null;
    } finally {
      client.close();
    }
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
    // Daily routine reminder → open the assistant for a quick consultation.
    if (data['routineReminder'] == '1') {
      router.go(Routes.assistant);
      return;
    }
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
