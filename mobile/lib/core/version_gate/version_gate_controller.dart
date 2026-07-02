import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/env/env.dart';
import '../storage/prefs.dart';

/// The installed app version ("1.2.3"). Overridden in [bootstrap] from
/// package_info_plus; the placeholder never blocks (0.0.0 < any minimum would,
/// so the override is mandatory — bootstrap always sets it).
final currentAppVersionProvider = Provider<String>((ref) => '0.0.0');

enum VersionGateStatus { unknown, ok, blocked }

class VersionGateState {
  const VersionGateState({
    this.status = VersionGateStatus.unknown,
    this.storeUrl,
    this.nudgeVersion,
  });

  final VersionGateStatus status;

  /// This OS's store link (App Store on iOS, Play Store elsewhere); null until
  /// fetched or when not configured in the dashboard.
  final String? storeUrl;

  /// Set when a dismissible "update available" prompt should be shown once.
  final String? nudgeVersion;
}

/// Server-driven app version gate (see `/app/version-gate` + the backend 426
/// middleware). Checks once at launch; the dio interceptor flips it to blocked
/// mid-session on any 426. Blocked state redirects the router to the
/// non-dismissible update screen. FAIL-OPEN: a failed check never blocks.
final versionGateControllerProvider =
    NotifierProvider<VersionGateController, VersionGateState>(
        VersionGateController.new);

class VersionGateController extends Notifier<VersionGateState> {
  // Bare client (no auth interceptor): the endpoint is public and this avoids
  // an import cycle with dio_client, which registers the 426 interceptor.
  late final Dio _dio = Dio(BaseOptions(
    baseUrl: ref.read(appConfigProvider).apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  @override
  VersionGateState build() {
    Future.microtask(check);
    return const VersionGateState();
  }

  Future<void> check() async {
    try {
      final data = await _fetchGate();
      final storeUrl = _storeUrlFor(data);
      final current = ref.read(currentAppVersionProvider);
      final min = data['minAppVersion'] as String?;
      if (min != null && _isBelow(current, min)) {
        state = VersionGateState(
            status: VersionGateStatus.blocked, storeUrl: storeUrl);
        return;
      }
      final latest = data['latestAppVersion'] as String?;
      final nudge = latest != null &&
              _isBelow(current, latest) &&
              ref.read(prefsProvider).lastNudgedVersion != latest
          ? latest
          : null;
      state = VersionGateState(
          status: VersionGateStatus.ok, storeUrl: storeUrl, nudgeVersion: nudge);
    } catch (_) {
      // Fail-open — never hold the app hostage on a network/server blip.
      if (state.status != VersionGateStatus.blocked) {
        state = VersionGateState(
            status: VersionGateStatus.ok, storeUrl: state.storeUrl);
      }
    }
  }

  /// Called by the dio interceptor when any request comes back 426.
  void markBlocked() {
    if (state.status == VersionGateStatus.blocked) return;
    state = VersionGateState(
        status: VersionGateStatus.blocked, storeUrl: state.storeUrl);
    // The gate endpoint is exempt from the 426 middleware, so a blocked client
    // can still resolve its store link for the update button.
    if (state.storeUrl == null) {
      _fetchGate().then((data) {
        state = VersionGateState(
            status: VersionGateStatus.blocked, storeUrl: _storeUrlFor(data));
      }).catchError((_) {});
    }
  }

  /// Persist that this version's nudge was shown (it appears once per version).
  void dismissNudge() {
    final version = state.nudgeVersion;
    if (version == null) return;
    ref.read(prefsProvider).setLastNudgedVersion(version);
    state = VersionGateState(status: state.status, storeUrl: state.storeUrl);
  }

  Future<Map<String, dynamic>> _fetchGate() async {
    final res = await _dio.get('/app/version-gate');
    return Map<String, dynamic>.from(res.data as Map);
  }

  String? _storeUrlFor(Map<String, dynamic> data) =>
      defaultTargetPlatform == TargetPlatform.iOS
          ? data['appStoreUrl'] as String?
          : data['playStoreUrl'] as String?;
}

/// true when [current] is a lower semver than [min]. Malformed input never
/// blocks (returns false) — fail-open on both sides.
bool _isBelow(String current, String min) {
  final a = _parse(current);
  final b = _parse(min);
  if (a == null || b == null) return false;
  for (var i = 0; i < 3; i++) {
    if (a[i] != b[i]) return a[i] < b[i];
  }
  return false;
}

List<int>? _parse(String v) {
  final m = RegExp(r'^(\d+)\.(\d+)(?:\.(\d+))?').firstMatch(v.trim());
  if (m == null) return null;
  return [
    int.parse(m.group(1)!),
    int.parse(m.group(2)!),
    int.parse(m.group(3) ?? '0'),
  ];
}
