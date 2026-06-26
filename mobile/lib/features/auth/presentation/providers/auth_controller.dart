import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../../../../core/storage/token_store.dart';
import '../../../notifications/data/push_service.dart';
import '../../data/auth_repository.dart';
import '../../data/models/auth_session.dart';
import '../../domain/customer.dart';

/// `unknown` = restoring on launch (show splash); then authenticated /
/// unauthenticated. Drives the go_router redirect guard.
enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState({required this.status, this.customer});

  final AuthStatus status;
  final Customer? customer;

  bool get isLoggedIn => status == AuthStatus.authenticated;

  static const unknown = AuthState(status: AuthStatus.unknown);
  static const loggedOut = AuthState(status: AuthStatus.unauthenticated);
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() {
    // Kick off session restore on first read; stay `unknown` until it resolves.
    Future.microtask(_restore);
    return AuthState.unknown;
  }

  TokenStore get _tokens => ref.read(tokenStoreProvider);
  AuthRepository get _repo => ref.read(authRepositoryProvider);

  // On launch: if we hold a refresh token, fetch /me (the interceptor refreshes
  // the access token if it has expired). Any failure → treat as logged out.
  Future<void> _restore() async {
    try {
      final refresh = await _tokens.refreshToken;
      if (refresh == null) {
        state = AuthState.loggedOut;
        return;
      }
      final result = await _repo.me();
      switch (result) {
        case Success(value: final customer):
          state = AuthState(status: AuthStatus.authenticated, customer: customer);
        case Failed():
          await _tokens.clear();
          state = AuthState.loggedOut;
      }
    } catch (_) {
      // Never strand the app on the splash if token storage misbehaves.
      state = AuthState.loggedOut;
    }
  }

  Future<Result<void>> login(String phone, String password) async =>
      _consume(await _repo.login(phone: phone, password: password));

  Future<Result<void>> verifyPhone(String phone, String code) async =>
      _consume(await _repo.verifyPhone(phone: phone, code: code));

  Future<Result<void>> register({
    required String name,
    required String phone,
    required String password,
    String? email,
  }) => _repo.register(
    name: name,
    phone: phone,
    password: password,
    email: email,
  );

  Future<Result<void>> forgotPassword(String phone) =>
      _repo.forgotPassword(phone);

  Future<Result<void>> resetPassword({
    required String phone,
    required String code,
    required String newPassword,
  }) => _repo.resetPassword(phone: phone, code: code, newPassword: newPassword);

  Future<Result<void>> resendVerification(String phone) =>
      _repo.resendOtp(phone: phone, purpose: 'PHONE_VERIFICATION');

  Future<Result<void>> updateProfile({String? name, String? email}) async =>
      _applyCustomer(await _repo.updateProfile(name: name, email: email));

  Future<Result<void>> uploadAvatar(String filePath) async =>
      _applyCustomer(await _repo.uploadAvatar(filePath));

  Future<Result<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) => _repo.changePassword(
    currentPassword: currentPassword,
    newPassword: newPassword,
  );

  // Reflect an updated customer (profile/avatar) into the authenticated state.
  Result<void> _applyCustomer(Result<Customer> result) {
    switch (result) {
      case Success(value: final customer):
        state = AuthState(status: AuthStatus.authenticated, customer: customer);
        return const Success(null);
      case Failed(failure: final f):
        return Failed(f);
    }
  }

  Future<void> logout() async {
    // Unregister this device for push WHILE still authenticated (the request
    // needs the access token, which clear() is about to drop). Best-effort.
    await ref.read(pushServiceProvider).onLogout();
    final refresh = await _tokens.refreshToken;
    await _repo.logout(refresh); // best-effort server-side revoke
    await _tokens.clear();
    state = AuthState.loggedOut;
  }

  /// Called by [AuthInterceptor] when a refresh fails irrecoverably.
  void onSessionExpired() {
    _tokens.clear();
    state = AuthState.loggedOut;
  }

  // Persist tokens and flip to authenticated on a successful session.
  Future<Result<void>> _consume(Result<AuthSession> result) async {
    switch (result) {
      case Success(value: final session):
        await _tokens.save(
          access: session.accessToken,
          refresh: session.refreshToken,
        );
        state = AuthState(
          status: AuthStatus.authenticated,
          customer: session.customer,
        );
        return const Success(null);
      case Failed(failure: final f):
        return Failed(f);
    }
  }
}
