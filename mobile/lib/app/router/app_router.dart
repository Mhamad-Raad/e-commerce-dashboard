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
import '../../features/cart/domain/checkout_draft.dart';
import '../../features/cart/domain/placed_order.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/cart/presentation/order_confirmation_screen.dart';
import '../../features/cart/presentation/payment_options_screen.dart';
import '../../features/cart/presentation/review_order_screen.dart';
import '../../features/cart/presentation/select_address_screen.dart';
import '../../features/assistant/presentation/assistant_screen.dart';
import '../../features/assistant/presentation/guest_assistant_screen.dart';
import '../../features/catalog/presentation/category_products_screen.dart';
import '../../features/catalog/presentation/home/home_screen.dart';
import '../../features/catalog/presentation/products_screen.dart';
import '../../features/catalog/presentation/store_detail_screen.dart';
import '../../features/catalog/presentation/stores_screen.dart';
import '../../features/favorites/presentation/favorites_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/orders/presentation/order_detail_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/info/presentation/about_screen.dart';
import '../../features/info/presentation/contact_screen.dart';
import '../../features/info/presentation/faq_screen.dart';
import '../../features/info/presentation/legal_screen.dart';
import '../../features/product/presentation/product_detail_screen.dart';
import '../../core/version_gate/update_required_screen.dart';
import '../../core/version_gate/version_gate_controller.dart';
import '../shell/main_shell.dart';
import 'routes.dart';

// Informational screens a logged-out visitor may open (About/FAQ/legal —
// harmless, and signup links to the legal pages).
const _infoRoutes = {
  Routes.about,
  Routes.faq,
  Routes.contact,
  Routes.privacy,
  Routes.terms,
  Routes.returnPolicy,
  Routes.shippingPolicy,
};

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

      // Version gate outranks auth: while blocked, every location redirects to
      // the update screen (426 mid-session or launch check below minimum).
      final gateBlocked = ref.read(versionGateControllerProvider).status ==
          VersionGateStatus.blocked;
      final onUpdateRequired = location == Routes.updateRequired;
      if (gateBlocked) return onUpdateRequired ? null : Routes.updateRequired;
      // No longer blocked (fail-open recheck): resume normal routing via splash.
      if (onUpdateRequired) return Routes.splash;
      // The one non-/auth screen a logged-out visitor may open: the assistant
      // trial. Signed-in users are bounced off it (they have the real tab).
      final onGuestAssistant = location == Routes.guestAssistant;

      // Still restoring the session: hold on the splash.
      if (status == AuthStatus.unknown) {
        return onSplash ? null : Routes.splash;
      }
      if (status == AuthStatus.authenticated) {
        // Logged in: leave the splash / auth screens / guest trial for home.
        return (onSplash || inAuth || onGuestAssistant) ? Routes.home : null;
      }
      // Resolved + logged out: leave the splash, allow the auth screens, the
      // guest assistant trial, and the informational pages; gate everything
      // else to login. (Splash is NOT an auth screen — a logged-out user
      // sitting on it must be sent to login.)
      final onInfo = _infoRoutes.contains(location);
      return (onSplash || !(inAuth || onGuestAssistant || onInfo))
          ? Routes.login
          : null;
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
      // Cart → checkout flow: options (payment/coupon/notes) → review.
      GoRoute(path: Routes.cart, builder: (_, _) => const CartScreen()),
      GoRoute(
        path: Routes.checkoutAddress,
        builder: (_, _) => const SelectAddressScreen(),
      ),
      GoRoute(
        path: Routes.checkoutOptions,
        builder: (_, state) =>
            PaymentOptionsScreen(addressId: state.extra as String? ?? ''),
      ),
      GoRoute(
        path: Routes.checkout,
        builder: (_, state) =>
            ReviewOrderScreen(draft: state.extra as CheckoutDraft),
      ),
      GoRoute(
        path: Routes.orderConfirmation,
        builder: (_, state) =>
            OrderConfirmationScreen(order: state.extra as PlacedOrder),
      ),
      // Guest assistant trial — reachable while logged out (see redirect).
      GoRoute(
        path: Routes.guestAssistant,
        builder: (_, _) => const GuestAssistantScreen(),
      ),
      // Hard version block (see the version-gate redirect above).
      GoRoute(
        path: Routes.updateRequired,
        builder: (_, _) => const UpdateRequiredScreen(),
      ),
      // Informational screens (also reachable logged-out — see redirect).
      GoRoute(path: Routes.about, builder: (_, _) => const AboutScreen()),
      GoRoute(path: Routes.faq, builder: (_, _) => const FaqScreen()),
      GoRoute(path: Routes.contact, builder: (_, _) => const ContactScreen()),
      GoRoute(
        path: Routes.privacy,
        builder: (_, _) => const LegalScreen(doc: LegalDoc.privacy),
      ),
      GoRoute(
        path: Routes.terms,
        builder: (_, _) => const LegalScreen(doc: LegalDoc.terms),
      ),
      GoRoute(
        path: Routes.returnPolicy,
        builder: (_, _) => const LegalScreen(doc: LegalDoc.returns),
      ),
      GoRoute(
        path: Routes.shippingPolicy,
        builder: (_, _) => const LegalScreen(doc: LegalDoc.shipping),
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

/// Bridges auth + version-gate state into a Listenable go_router can watch.
/// Listening also instantiates the version-gate controller, which kicks off
/// its launch check.
class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(Ref ref) {
    ref.listen<AuthState>(authControllerProvider, (_, _) => notifyListeners());
    ref.listen<VersionGateState>(
        versionGateControllerProvider, (_, _) => notifyListeners());
  }
}
