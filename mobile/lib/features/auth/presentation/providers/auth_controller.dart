import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Whether a session exists. Drives the go_router redirect guard.
/// Placeholder logic until the backend phone+password auth lands.
final isLoggedInProvider =
    NotifierProvider<AuthController, bool>(AuthController.new);

class AuthController extends Notifier<bool> {
  @override
  bool build() => false; // TODO(auth): restore session from refresh token on launch.

  /// Temporary: stands in for a real phone+password login.
  void logInDemo() => state = true;

  void logOut() => state = false;
}
