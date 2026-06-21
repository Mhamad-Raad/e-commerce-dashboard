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

  // TODO: replace with the real dev/prod API base URLs (Neon/Render dev; prod parked).
  static const dev = AppConfig(
    env: Env.dev,
    apiBaseUrl: 'https://dev-api.rozhna.example/api',
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
