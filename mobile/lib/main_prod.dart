import 'app/env/env.dart';
import 'bootstrap.dart';

/// Prod flavor entrypoint: `flutter run -t lib/main_prod.dart`
void main() => bootstrap(AppConfig.prod);
