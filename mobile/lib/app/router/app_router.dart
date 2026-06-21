import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login/login_screen.dart';
import '../../features/auth/presentation/providers/auth_controller.dart';
import '../../features/catalog/presentation/home/home_screen.dart';
import 'routes.dart';

/// App router. A single [redirect] enforces auth gating (no guest checkout).
final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = _AuthRefresh(ref);

  return GoRouter(
    initialLocation: Routes.home,
    refreshListenable: auth,
    redirect: (context, state) {
      final loggedIn = ref.read(isLoggedInProvider);
      final goingToAuth = state.matchedLocation.startsWith('/auth');
      if (!loggedIn && !goingToAuth) return Routes.login;
      if (loggedIn && goingToAuth) return Routes.home;
      return null;
    },
    routes: [
      GoRoute(path: Routes.home, builder: (_, _) => const HomeScreen()),
      GoRoute(path: Routes.login, builder: (_, _) => const LoginScreen()),
    ],
  );
});

/// Bridges the [isLoggedInProvider] state into a Listenable go_router can watch.
class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(Ref ref) {
    ref.listen<bool>(isLoggedInProvider, (_, _) => notifyListeners());
  }
}
