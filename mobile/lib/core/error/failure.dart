/// Typed failures surfaced by repositories. Dart-native sealed class
/// (no freezed needed) so the UI can switch exhaustively.
sealed class Failure implements Exception {
  const Failure(this.message);
  final String message;

  @override
  String toString() => '$runtimeType: $message';
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No internet connection']);
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {this.statusCode});
  final int? statusCode;
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Authentication required']);
}

/// 403 with code PHONE_NOT_VERIFIED — the account exists but its number was never
/// verified. The UI routes to the OTP screen (the backend re-sent a code).
class PhoneNotVerifiedFailure extends Failure {
  const PhoneNotVerifiedFailure([super.message = 'Phone number not verified']);
}

/// 409 — e.g. the phone number or email is already registered.
class ConflictFailure extends Failure {
  const ConflictFailure(super.message);
}

/// 429 — rate limited (resend cooldown, too many attempts, throttler).
class RateLimitFailure extends Failure {
  const RateLimitFailure([super.message = 'Too many attempts. Try again shortly.']);
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message);
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Something went wrong']);
}
