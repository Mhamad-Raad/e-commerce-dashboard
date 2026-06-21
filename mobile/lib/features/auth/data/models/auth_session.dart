import '../../domain/customer.dart';

/// A successful authentication: the token pair + the customer. Returned by
/// login and verify-phone (which auto-logs-in).
class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.customer,
  });

  final String accessToken;
  final String refreshToken;
  final Customer customer;

  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
        customer:
            Customer.fromJson(Map<String, dynamic>.from(json['customer'] as Map)),
      );
}
