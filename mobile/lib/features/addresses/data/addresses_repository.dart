import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/error_mapper.dart';
import '../../../core/network/api_result.dart';
import '../domain/address.dart';
import 'addresses_api.dart';

final addressesRepositoryProvider = Provider<AddressesRepository>(
    (ref) => AddressesRepository(ref.watch(addressesApiProvider)));

class AddressesRepository {
  AddressesRepository(this._api);
  final AddressesApi _api;

  Future<Result<List<Address>>> list() async {
    try {
      final raw = await _api.getAll();
      final addresses = raw
          .whereType<Map>()
          .map((e) => Address.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      return Success(addresses);
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<Address>> create(AddressInput input) async {
    try {
      final json = await _api.create(input.toJson());
      return Success(Address.fromJson(json));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<Address>> update(String id, AddressInput input) async {
    try {
      final json = await _api.update(id, input.toJson());
      return Success(Address.fromJson(json));
    } catch (e) {
      return Failed(mapError(e));
    }
  }

  Future<Result<void>> remove(String id) async {
    try {
      await _api.delete(id);
      return const Success(null);
    } catch (e) {
      return Failed(mapError(e));
    }
  }
}
