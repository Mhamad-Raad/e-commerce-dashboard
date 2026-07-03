/// Route paths. Keep in sync with [appRouterProvider].
class Routes {
  Routes._();

  static const splash = '/splash';
  // Main tabs (inside the bottom-nav shell): Home · Products · Assistant · Profile.
  static const home = '/home';
  static const products = '/products';
  static const assistant = '/assistant';
  static const profile = '/profile';
  // Stores showcase (pushed over the shell).
  static const stores = '/stores';
  static String storeDetail(String id) => '/store/$id';
  // Products filtered to one category (pushed over the shell).
  static String categoryProducts(String id) => '/category/$id';
  static const blog = '/blog'; // article route is '/blog/:id'; both public
  // Addresses (pushed over the tab shell; require auth).
  static const addresses = '/addresses';
  static const addressNew = '/addresses/new';
  static String addressEdit(String id) => '/addresses/$id/edit';
  // Product detail + favorites (pushed over the tab shell; require auth).
  static String productDetail(String id) => '/product/$id';
  static String productReviews(String id) => '/product/$id/reviews';
  static const favorites = '/favorites';
  // Orders (pushed over the tab shell; require auth).
  static const orders = '/orders';
  static String orderDetail(String id) => '/orders/$id';
  // Notification centre (pushed over the tab shell; require auth).
  static const notifications = '/notifications';
  // Account settings.
  static const editProfile = '/profile/edit';
  static const changePassword = '/profile/change-password';
  // Cart → checkout flow (pushed over the tab shell; require auth):
  // cart → options (payment/coupon/notes) → checkout (review) → confirmation.
  // checkoutAddress is a picker pushed from cart/review; it pops with the id.
  static const cart = '/cart';
  static const checkoutAddress = '/checkout/address';
  static const checkoutOptions = '/checkout/options';
  static const checkout = '/checkout';
  static const orderConfirmation = '/order-confirmation';
  // Guest assistant trial — the ONE screen a logged-out visitor may open outside
  // the /auth/* screens (see the redirect in appRouterProvider).
  static const guestAssistant = '/guest/assistant';
  // Hard version block (server-driven) — reachable regardless of auth state.
  static const updateRequired = '/update-required';
  // Informational screens — also reachable while logged out (see redirect).
  static const about = '/about';
  static const faq = '/faq';
  static const contact = '/contact';
  static const privacy = '/privacy';
  static const terms = '/terms';
  static const returnPolicy = '/return-policy';
  static const shippingPolicy = '/shipping-policy';
  static const login = '/auth/login';
  static const signup = '/auth/signup';
  static const otp = '/auth/otp';
  static const forgotPassword = '/auth/forgot-password';
  static const resetPassword = '/auth/reset-password';
}
