import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_result.dart';
import '../../data/addresses_repository.dart';
import '../../domain/address.dart';

/// Backend caps a customer at this many addresses (mirror of
/// `AddressesService.MAX_ADDRESSES`) — used to hide "add" once reached.
const maxAddresses = 3;

/// The customer's addresses as an [AsyncValue], plus CRUD that refreshes the
/// list. Mutations return a [Result] so the form/list can surface failures.
final addressesControllerProvider =
    AsyncNotifierProvider<AddressesController, List<Address>>(
        AddressesController.new);

class AddressesController extends AsyncNotifier<List<Address>> {
  AddressesRepository get _repo => ref.read(addressesRepositoryProvider);

  @override
  Future<List<Address>> build() async {
    final result = await _repo.list();
    return result.unwrapOrThrow();
  }

  Future<Result<Address>> save(AddressInput input, {String? id}) async {
    final result =
        id == null ? await _repo.create(input) : await _repo.update(id, input);
    if (result is Success<Address>) await _reload();
    return result;
  }

  Future<Result<void>> delete(String id) async {
    final result = await _repo.remove(id);
    if (result is Success<void>) await _reload();
    return result;
  }

  Future<Result<Address>> setDefault(Address address) async {
    final result = await _repo.update(address.id, address.toInput(isDefault: true));
    if (result is Success<Address>) await _reload();
    return result;
  }

  // Re-fetch without flipping to a full-screen loading state (avoids a flicker
  // after a mutation); the list rebuilds in place.
  Future<void> _reload() async {
    state = await AsyncValue.guard(() async => (await _repo.list()).unwrapOrThrow());
  }
}
