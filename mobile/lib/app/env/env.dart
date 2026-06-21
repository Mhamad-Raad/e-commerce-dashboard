import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Build flavor.
enum Env { dev, prod }

/// Per-flavor configuration. Injected via Riverpod override in [bootstrap].
class AppConfig {
  const AppConfig({
    required this.env,
    required this.apiBaseUrl,
    this.assistantEnabled = false,
  });

  final Env env;
  final String apiBaseUrl;
  final bool assistantEnabled;

  // Local backend for now. 10.0.2.2 = the host machine from the Android emulator;
  // use http://localhost:3000/api on an iOS simulator, or your machine's LAN IP
  // (e.g. http://192.168.x.x:3000/api) from a physical device. Swap to the
  // deployed Render dev URL once the customer-auth endpoints are pushed there.
  static const dev = AppConfig(
    env: Env.dev,
    apiBaseUrl: 'http://10.0.2.2:3000/api',
  );

  static const prod = AppConfig(
    env: Env.prod,
    apiBaseUrl: 'https://api.rozhna.example/api',
  );
}

/// Overridden in [bootstrap] with the active flavor's config.
final appConfigProvider = Provider<AppConfig>(
  (ref) => throw UnimplementedError('appConfigProvider must be overridden in bootstrap'),
);
