import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../version_gate/version_gate_controller.dart';

/// Stamps every request with the installed version and reacts to the backend's
/// 426 Upgrade Required refusals by flipping the version gate to blocked (the
/// router then forces the update screen). The error still propagates so the
/// in-flight call fails normally underneath the redirect.
class VersionGateInterceptor extends Interceptor {
  VersionGateInterceptor(this._ref);

  final Ref _ref;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['X-App-Version'] = _ref.read(currentAppVersionProvider);
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 426) {
      _ref.read(versionGateControllerProvider.notifier).markBlocked();
    }
    handler.next(err);
  }
}
