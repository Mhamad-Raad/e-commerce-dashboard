/// The authenticated customer, as returned by /api/app/auth (login, verify, me).
class Customer {
  const Customer({
    required this.id,
    required this.name,
    this.gender,
    this.email,
    this.phone,
    this.avatarUrl,
    this.phoneVerifiedAt,
  });

  final String id;
  final String name;
  /// 'FEMALE' | 'MALE'. Null for customers created before the field existed.
  final String? gender;
  final String? email;
  final String? phone;
  final String? avatarUrl;
  final DateTime? phoneVerifiedAt;

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as String,
        name: (json['name'] as String?) ?? '',
        gender: json['gender'] as String?,
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        avatarUrl: json['avatarUrl'] as String?,
        phoneVerifiedAt: json['phoneVerifiedAt'] == null
            ? null
            : DateTime.tryParse(json['phoneVerifiedAt'].toString()),
      );
}
