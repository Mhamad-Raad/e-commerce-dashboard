import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

/// Business contact details from `GET /app/contact` (dashboard-editable
/// Settings). Null fields hide their row on the contact screen.
class ContactInfo {
  const ContactInfo({this.businessName, this.phone, this.email, this.address});

  final String? businessName;
  final String? phone;
  final String? email;
  final String? address;

  factory ContactInfo.fromJson(Map<String, dynamic> json) => ContactInfo(
        businessName: json['businessName'] as String?,
        phone: json['phone'] as String?,
        email: json['email'] as String?,
        address: json['address'] as String?,
      );

  /// Digits-only phone for wa.me links ("+964 770..." → "964770...").
  String? get whatsAppNumber {
    final p = phone;
    if (p == null) return null;
    final digits = p.replaceAll(RegExp(r'\D'), '');
    return digits.isEmpty ? null : digits;
  }
}

final contactInfoProvider = FutureProvider.autoDispose<ContactInfo>((ref) async {
  final res = await ref.watch(dioProvider).get('/app/contact');
  return ContactInfo.fromJson(Map<String, dynamic>.from(res.data as Map));
});
