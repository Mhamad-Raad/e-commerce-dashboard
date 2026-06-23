import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/network/api_result.dart';
import '../../auth/presentation/widgets/auth_widgets.dart';
import '../domain/address.dart';
import '../domain/iraq_geo.dart';
import 'providers/addresses_controller.dart';

/// Create or edit a delivery address. Governorate drives a dependent city
/// dropdown (mirrors the backend's governorate→city validation). When
/// [address] is non-null the form is in edit mode.
class AddressFormScreen extends ConsumerStatefulWidget {
  const AddressFormScreen({super.key, this.address});

  final Address? address;

  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  late final TextEditingController _label;
  late final TextEditingController _district;
  late final TextEditingController _street;
  late final TextEditingController _landmark;
  late final TextEditingController _phone;

  String? _governorate;
  String? _city;
  bool _isDefault = false;
  bool _loading = false;

  bool get _isEdit => widget.address != null;

  @override
  void initState() {
    super.initState();
    final a = widget.address;
    _label = TextEditingController(text: a?.label ?? '');
    _district = TextEditingController(text: a?.district ?? '');
    _street = TextEditingController(text: a?.street ?? '');
    _landmark = TextEditingController(text: a?.nearestLandmark ?? '');
    _phone = TextEditingController(text: a?.phone ?? '');
    _governorate = a?.governorate;
    _city = a?.city;
    _isDefault = a?.isDefault ?? false;
  }

  @override
  void dispose() {
    _label.dispose();
    _district.dispose();
    _street.dispose();
    _landmark.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = context.l10n;
    if (_governorate == null || _city == null) {
      showMessage(context, l10n.governorateCityRequired);
      return;
    }
    setState(() => _loading = true);
    final input = AddressInput(
      label: _label.text,
      governorate: _governorate!,
      city: _city!,
      district: _district.text,
      street: _street.text,
      nearestLandmark: _landmark.text,
      phone: _phone.text,
      isDefault: _isDefault,
    );
    final result = await ref
        .read(addressesControllerProvider.notifier)
        .save(input, id: widget.address?.id);
    if (!mounted) return;
    setState(() => _loading = false);
    switch (result) {
      case Success():
        context.pop();
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cities = IraqGeo.citiesOf(_governorate);

    return AuthScaffold(
      appBar: AppBar(title: Text(_isEdit ? l10n.editAddress : l10n.addAddress)),
      children: [
        AuthField(
          controller: _label,
          label: l10n.addressLabel,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        DropdownButtonFormField<String>(
          initialValue: _governorate,
          isExpanded: true,
          decoration: InputDecoration(labelText: l10n.governorate),
          hint: Text(l10n.selectGovernorate),
          items: [
            for (final g in IraqGeo.governorates)
              DropdownMenuItem(value: g, child: Text(humanizeGeo(g))),
          ],
          onChanged: (value) => setState(() {
            _governorate = value;
            // Reset the city when the governorate changes — the old city may
            // not belong to the new governorate.
            if (!IraqGeo.isValidPair(value, _city)) _city = null;
          }),
        ),
        const SizedBox(height: AppSpacing.md),
        DropdownButtonFormField<String>(
          initialValue: _city,
          isExpanded: true,
          decoration: InputDecoration(labelText: l10n.city),
          hint: Text(l10n.selectCity),
          items: [
            for (final c in cities)
              DropdownMenuItem(value: c, child: Text(humanizeGeo(c))),
          ],
          onChanged: _governorate == null
              ? null
              : (value) => setState(() => _city = value),
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _district,
          label: l10n.district,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _street,
          label: l10n.street,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _landmark,
          label: l10n.nearestLandmark,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: AppSpacing.md),
        AuthField(
          controller: _phone,
          label: l10n.contactPhone,
          keyboardType: TextInputType.phone,
          prefixText: '+964 ',
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.sm),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          value: _isDefault,
          onChanged: (v) => setState(() => _isDefault = v),
          title: Text(l10n.setAsDefault),
        ),
        const SizedBox(height: AppSpacing.md),
        PrimaryButton(
          label: l10n.saveAddress,
          loading: _loading,
          onPressed: _submit,
        ),
      ],
    );
  }
}
