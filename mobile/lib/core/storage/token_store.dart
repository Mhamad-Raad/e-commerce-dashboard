import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Access + refresh tokens, stored encrypted (Keychain / Keystore).
/// Mobile uses bearer tokens — NO cookies (unlike the web dashboard).
final tokenStoreProvider = Provider<TokenStore>((ref) => SecureTokenStore());

abstract class TokenStore {
  Future<String?> get accessToken;
  Future<String?> get refreshToken;
  Future<void> save({required String access, required String refresh});
  Future<void> clear();
}

class SecureTokenStore implements TokenStore {
  final _storage = const FlutterSecureStorage();

  static const _kAccess = 'access_token';
  static const _kRefresh = 'refresh_token';

  @override
  Future<String?> get accessToken => _storage.read(key: _kAccess);

  @override
  Future<String?> get refreshToken => _storage.read(key: _kRefresh);

  @override
  Future<void> save({required String access, required String refresh}) async {
    await _storage.write(key: _kAccess, value: access);
    await _storage.write(key: _kRefresh, value: refresh);
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _kAccess);
    await _storage.delete(key: _kRefresh);
  }
}
