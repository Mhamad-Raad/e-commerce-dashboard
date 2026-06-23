/// Route paths. Keep in sync with [appRouterProvider].
class Routes {
  Routes._();

  static const splash = '/splash';
  // Main tabs (inside the bottom-nav shell).
  static const home = '/home';
  static const shop = '/shop';
  static const search = '/search';
  static const profile = '/profile';
  static const blog = '/blog'; // article route is '/blog/:id'
  // Addresses (pushed over the tab shell; require auth).
  static const addresses = '/addresses';
  static const addressNew = '/addresses/new';
  static String addressEdit(String id) => '/addresses/$id/edit';
  // Product detail + favorites (pushed over the tab shell; require auth).
  static String productDetail(String id) => '/product/$id';
  static const favorites = '/favorites';
  // Cart → checkout flow (pushed over the tab shell; require auth).
  static const cart = '/cart';
  static const checkoutAddress = '/checkout/address';
  static const checkout = '/checkout';
  static const orderConfirmation = '/order-confirmation';
  static const login = '/auth/login';
  static const signup = '/auth/signup';
  static const otp = '/auth/otp';
  static const forgotPassword = '/auth/forgot-password';
  static const resetPassword = '/auth/reset-password';
}
