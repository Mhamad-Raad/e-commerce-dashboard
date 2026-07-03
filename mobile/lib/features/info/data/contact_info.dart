import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

/// Business contact details from `GET /app/contact` (dashboard-editable
/// Settings). Null fields hide their row on the contact screen.
class ContactInfo {
  const ContactInfo({
    this.businessName,
    this.phone,
    this.email,
    this.address,
    this.whatsapp,
    this.instagram,
    this.facebook,
    this.tiktok,
    this.snapchat,
    this.youtube,
    this.x,
  });

  final String? businessName;
  final String? phone;
  final String? email;
  final String? address;
  // Social channels: whatsapp is a phone number, the rest profile URLs.
  final String? whatsapp;
  final String? instagram;
  final String? facebook;
  final String? tiktok;
  final String? snapchat;
  final String? youtube;
  final String? x;

  factory ContactInfo.fromJson(Map<String, dynamic> json) => ContactInfo(
        businessName: json['businessName'] as String?,
        phone: json['phone'] as String?,
        email: json['email'] as String?,
        address: json['address'] as String?,
        whatsapp: json['whatsapp'] as String?,
        instagram: json['instagram'] as String?,
        facebook: json['facebook'] as String?,
        tiktok: json['tiktok'] as String?,
        snapchat: json['snapchat'] as String?,
        youtube: json['youtube'] as String?,
        x: json['x'] as String?,
      );

  /// Digits-only number for wa.me links; the dedicated WhatsApp number wins
  /// over the call number ("+964 770..." → "964770...").
  String? get whatsAppNumber {
    final p = whatsapp ?? phone;
    if (p == null) return null;
    final digits = p.replaceAll(RegExp(r'\D'), '');
    return digits.isEmpty ? null : digits;
  }

  bool get hasSocials =>
      [instagram, facebook, tiktok, snapchat, youtube, x]
          .any((u) => u != null && u.isNotEmpty);
}

final contactInfoProvider = FutureProvider.autoDispose<ContactInfo>((ref) async {
  final res = await ref.watch(dioProvider).get('/app/contact');
  return ContactInfo.fromJson(Map<String, dynamic>.from(res.data as Map));
});
