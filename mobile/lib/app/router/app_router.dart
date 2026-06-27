import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/forgot/forgot_password_screen.dart';
import '../../features/auth/presentation/login/login_screen.dart';
import '../../features/auth/presentation/otp/otp_screen.dart';
import '../../features/auth/presentation/providers/auth_controller.dart';
import '../../features/auth/presentation/reset/reset_password_screen.dart';
import '../../features/auth/presentation/signup/signup_screen.dart';
import '../../features/auth/presentation/splash/splash_screen.dart';
import '../../features/account/presentation/change_password_screen.dart';
import '../../features/account/presentation/edit_profile_screen.dart';
import '../../features/account/presentation/profile_screen.dart';
import '../../features/addresses/domain/address.dart';
import '../../features/addresses/presentation/address_form_screen.dart';
import '../../features/addresses/presentation/addresses_screen.dart';
import '../../features/blog/presentation/blog_article_screen.dart';
import '../../features/cart/domain/placed_order.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/cart/presentation/checkout_screen.dart';
import '../../features/cart/presentation/order_confirmation_screen.dart';
import '../../features/cart/presentation/select_address_screen.dart';
import '../../features/assistant/presentation/assistant_screen.dart';
import '../../features/catalog/presentation/category_products_screen.dart';
import '../../features/catalog/presentation/home/home_screen.dart';
import '../../features/catalog/presentation/products_screen.dart';
import '../../features/catalog/presentation/store_detail_screen.dart';
import '../../features/catalog/presentation/stores_screen.dart';
import '../../features/favorites/presentation/favorites_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/orders/presentation/order_detail_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/product/presentation/product_detail_screen.dart';
import '../shell/main_shell.dart';
import 'routes.dart';

/// App router. A single [redirect] enforces auth gating (no guest checkout):
/// while the session is restoring we sit on the splash, then route to home or
/// login based on the resolved [AuthStatus].
final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = _AuthRefresh(ref);

  return GoRouter(
    initialLocation: Routes.splash,
    refreshListenable: auth,
    redirect: (context, state) {
      final status = ref.read(authControllerProvider).status;
      final location = state.matchedLocation;
      final onSplash = location == Routes.splash;
      final inAuth = location.startsWith('/auth');

      // Still restoring the session: hold on the splash.
      if (status == AuthStatus.unknown) {
        return onSplash ? null : Routes.splash;
      }
      if (status == AuthStatus.authenticated) {
        // Logged in: leave the splash / auth screens for home.
        return (onSplash || inAuth) ? Routes.home : null;
      }
      // Resolved + logged out: leave the splash, allow the auth screens,
      // gate everything else to login. (Splash is NOT an auth screen — a
      // logged-out user sitting on it must be sent to login, not left there.)
      return (onSplash || !inAuth) ? Routes.login : null;
    },
    routes: [
      GoRoute(path: Routes.splash, builder: (_, _) => const SplashScreen()),
      // Authenticated main tabs, each an independent navigation branch.
      StatefulShellRoute.indexedStack(
        builder: (_, _, navigationShell) =>
            MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.home, builder: (_, _) => const HomeScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: Routes.products,
                builder: (_, _) => const ProductsScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
                path: Routes.assistant,
                builder: (_, _) => const AssistantScreen()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: Routes.profile, builder: (_, _) => const ProfileScreen()),
          ]),
        ],
      ),
      // Full-screen article reader, pushed over the tab shell.
      GoRoute(
        path: '${Routes.blog}/:id',
        builder: (_, state) =>
            BlogArticleScreen(id: state.pathParameters['id']!),
      ),
      // Addresses — listed, created, and edited over the tab shell.
      GoRoute(
        path: Routes.addresses,
        builder: (_, _) => const AddressesScreen(),
      ),
      GoRoute(
        path: Routes.addressNew,
        builder: (_, _) => const AddressFormScreen(),
      ),
      GoRoute(
        path: '${Routes.addresses}/:id/edit',
        builder: (_, state) =>
            AddressFormScreen(address: state.extra as Address?),
      ),
      // Product detail + favorites.
      GoRoute(
        path: '/product/:id',
        builder: (_, state) =>
            ProductDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: Routes.favorites,
        builder: (_, _) => const FavoritesScreen(),
      ),
      // Stores showcase.
      GoRoute(path: Routes.stores, builder: (_, _) => const StoresScreen()),
      GoRoute(
        path: '/store/:id',
        builder: (_, state) =>
            StoreDetailScreen(id: state.pathParameters['id']!),
      ),
      // Products filtered to one category (category name passed via `extra`).
      GoRoute(
        path: '/category/:id',
        builder: (_, state) => CategoryProductsScreen(
          id: state.pathParameters['id']!,
          name: state.extra as String?,
        ),
      ),
      // Account settings.
      GoRoute(
        path: Routes.editProfile,
        builder: (_, _) => const EditProfileScreen(),
      ),
      GoRoute(
        path: Routes.changePassword,
        builder: (_, _) => const ChangePasswordScreen(),
      ),
      // Orders.
      GoRoute(path: Routes.orders, builder: (_, _) => const OrdersScreen()),
      GoRoute(
        path: '/orders/:id',
        builder: (_, state) =>
            OrderDetailScreen(id: state.pathParameters['id']!),
      ),
      // Notification centre.
      GoRoute(
        path: Routes.notifications,
        builder: (_, _) => const NotificationsScreen(),
      ),
      // Cart → checkout flow.
      GoRoute(path: Routes.cart, builder: (_, _) => const CartScreen()),
      GoRoute(
        path: Routes.checkoutAddress,
        builder: (_, _) => const SelectAddressScreen(),
      ),
      GoRoute(
        path: Routes.checkout,
        builder: (_, state) =>
            CheckoutScreen(addressId: state.extra as String? ?? ''),
      ),
      GoRoute(
        path: Routes.orderConfirmation,
        builder: (_, state) =>
            OrderConfirmationScreen(order: state.extra as PlacedOrder),
      ),
      GoRoute(path: Routes.login, builder: (_, _) => const LoginScreen()),
      GoRoute(path: Routes.signup, builder: (_, _) => const SignupScreen()),
      GoRoute(
        path: Routes.otp,
        builder: (_, state) => OtpScreen(phone: _phoneArg(state)),
      ),
      GoRoute(
        path: Routes.forgotPassword,
        builder: (_, _) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: Routes.resetPassword,
        builder: (_, state) => ResetPasswordScreen(phone: _phoneArg(state)),
      ),
    ],
  );
});

// OTP / reset screens receive the phone via `extra: {'phone': ...}`.
String _phoneArg(GoRouterState state) {
  final extra = state.extra;
  return extra is Map && extra['phone'] is String ? extra['phone'] as String : '';
}

/// Bridges [authControllerProvider] into a Listenable go_router can watch.
class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(Ref ref) {
    ref.listen<AuthState>(authControllerProvider, (_, _) => notifyListeners());
  }
}
