import 'iraq_geo.dart';

/// A customer delivery address. `governorate`/`city` hold the backend enum names
/// (e.g. `BAGHDAD`, `SADR_CITY`); use [humanizeGeo] for display.
class Address {
  const Address({
    required this.id,
    required this.governorate,
    required this.city,
    this.label,
    this.district,
    this.street,
    this.nearestLandmark,
    this.phone,
    this.isDefault = false,
  });

  final String id;
  final String governorate;
  final String city;
  final String? label;
  final String? district;
  final String? street;
  final String? nearestLandmark;
  final String? phone;
  final bool isDefault;

  /// Governorate + city, plus any provided street/district detail, as readable
  /// comma-separated lines for a card. Most-specific first.
  String get summary {
    final parts = <String>[
      if (street != null && street!.isNotEmpty) street!,
      if (district != null && district!.isNotEmpty) district!,
      humanizeGeo(city),
      humanizeGeo(governorate),
    ];
    return parts.join(', ');
  }

  factory Address.fromJson(Map<String, dynamic> json) => Address(
        id: json['id'] as String,
        governorate: json['governorate'] as String,
        city: json['city'] as String,
        label: json['label'] as String?,
        district: json['district'] as String?,
        street: json['street'] as String?,
        nearestLandmark: json['nearestLandmark'] as String?,
        phone: json['phone'] as String?,
        isDefault: (json['isDefault'] as bool?) ?? false,
      );

  /// Build an [AddressInput] from this address, optionally overriding a field
  /// (used by "set as default" without opening the form).
  AddressInput toInput({bool? isDefault}) => AddressInput(
        label: label,
        governorate: governorate,
        city: city,
        district: district,
        street: street,
        nearestLandmark: nearestLandmark,
        phone: phone,
        isDefault: isDefault ?? this.isDefault,
      );
}

/// The editable payload sent on create/update. `label` is omitted when blank
/// (the backend requires length ≥ 1 when present); the other optional text
/// fields are always sent so the form can clear them on edit.
class AddressInput {
  const AddressInput({
    this.label,
    required this.governorate,
    required this.city,
    this.district,
    this.street,
    this.nearestLandmark,
    this.phone,
    this.isDefault,
  });

  final String? label;
  final String governorate;
  final String city;
  final String? district;
  final String? street;
  final String? nearestLandmark;
  final String? phone;
  final bool? isDefault;

  Map<String, dynamic> toJson() => {
        if (label != null && label!.trim().isNotEmpty) 'label': label!.trim(),
        'governorate': governorate,
        'city': city,
        'district': district?.trim() ?? '',
        'street': street?.trim() ?? '',
        'nearestLandmark': nearestLandmark?.trim() ?? '',
        'phone': phone?.trim() ?? '',
        if (isDefault != null) 'isDefault': isDefault,
      };
}
