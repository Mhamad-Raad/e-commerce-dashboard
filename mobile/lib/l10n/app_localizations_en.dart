// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get brandName => 'Rozhna\'s Store';

  @override
  String get loginSubtitle => 'Log in to continue';

  @override
  String get phoneNumber => 'Phone number';

  @override
  String get password => 'Password';

  @override
  String get forgotPassword => 'Forgot password?';

  @override
  String get logIn => 'Log in';

  @override
  String get newHere => 'New here?';

  @override
  String get createAccount => 'Create account';

  @override
  String get enterPhoneAndPassword => 'Enter your phone number and password.';

  @override
  String get verifyToContinue =>
      'Verify your number to continue — we sent a code.';

  @override
  String get createYourAccount => 'Create your account';

  @override
  String get fullName => 'Full name';

  @override
  String get emailOptional => 'Email (optional)';

  @override
  String get passwordMin8 => 'Password (min 8 characters)';

  @override
  String get namePhonePasswordRequired =>
      'Name, phone and password are required.';

  @override
  String get numberAlreadyRegistered =>
      'This number already has an account. Please log in.';

  @override
  String get gender => 'Gender';

  @override
  String get genderFemale => 'Female';

  @override
  String get genderMale => 'Male';

  @override
  String get genderRequired => 'Please select your gender.';

  @override
  String get routineReminderTitle => 'Your skincare moment ✨';

  @override
  String get routineReminderBody =>
      'Have you done your routine today? Tap for a quick check-in.';

  @override
  String get verifyYourNumber => 'Verify your number';

  @override
  String otpSentTo(String phone) {
    return 'Enter the code we sent on WhatsApp to $phone.';
  }

  @override
  String get verificationCode => 'Verification code';

  @override
  String get verify => 'Verify';

  @override
  String get resendCode => 'Didn\'t get it? Resend code';

  @override
  String get newCodeSent => 'A new code is on its way.';

  @override
  String get enterTheCode => 'Enter the code we sent you.';

  @override
  String get resetPassword => 'Reset password';

  @override
  String get forgotSubtitle =>
      'Enter your phone number and we\'ll send a reset code on WhatsApp.';

  @override
  String get sendCode => 'Send code';

  @override
  String get enterPhone => 'Enter your phone number.';

  @override
  String get ifRegisteredCodeSent =>
      'If the number is registered, a code was sent.';

  @override
  String get newPasswordTitle => 'New password';

  @override
  String get newPasswordSubtitle =>
      'Enter the code we sent and choose a new password.';

  @override
  String get resetCode => 'Reset code';

  @override
  String get newPasswordMin8 => 'New password (min 8 characters)';

  @override
  String get savePassword => 'Save password';

  @override
  String get fillCodeAndPassword => 'Fill in the code and your new password.';

  @override
  String get passwordUpdated => 'Password updated. Please log in.';

  @override
  String get logOut => 'Log out';

  @override
  String get tabHome => 'Home';

  @override
  String get tabShop => 'Shop';

  @override
  String get tabSearch => 'Search';

  @override
  String get tabProfile => 'Profile';

  @override
  String get categoriesTitle => 'Categories';

  @override
  String get featuredTitle => 'Featured';

  @override
  String get shopsTitle => 'Shops';

  @override
  String get seeAll => 'See all';

  @override
  String get homeLoadError => 'Couldn\'t load the home page.';

  @override
  String get retry => 'Retry';

  @override
  String get comingSoon => 'Coming soon';

  @override
  String get linkOpenError => 'Couldn\'t open the link.';

  @override
  String get toggleTheme => 'Toggle theme';

  @override
  String get language => 'Language';

  @override
  String get account => 'Account';

  @override
  String get myAddresses => 'My addresses';

  @override
  String get addAddress => 'Add address';

  @override
  String get editAddress => 'Edit address';

  @override
  String get noAddressesYet => 'No addresses yet';

  @override
  String get addAddressHint =>
      'Add a delivery address so we know where to ship your orders.';

  @override
  String get addressLabel => 'Label (e.g. Home, Work)';

  @override
  String get addressFallbackLabel => 'Address';

  @override
  String get governorate => 'Governorate';

  @override
  String get city => 'City';

  @override
  String get district => 'District';

  @override
  String get street => 'Street';

  @override
  String get nearestLandmark => 'Nearest landmark';

  @override
  String get contactPhone => 'Contact phone';

  @override
  String get setAsDefault => 'Set as default';

  @override
  String get defaultBadge => 'Default';

  @override
  String get saveAddress => 'Save address';

  @override
  String get selectGovernorate => 'Select a governorate';

  @override
  String get selectCity => 'Select a city';

  @override
  String get governorateCityRequired => 'Please choose a governorate and city.';

  @override
  String get deleteAddress => 'Delete address';

  @override
  String get deleteAddressConfirm => 'Delete this address?';

  @override
  String get delete => 'Delete';

  @override
  String get cancel => 'Cancel';

  @override
  String get addressDeleted => 'Address deleted.';

  @override
  String get addressesLoadError => 'Couldn\'t load your addresses.';

  @override
  String get makeDefault => 'Make default';

  @override
  String get cartTitle => 'Cart';

  @override
  String get cartEmpty => 'Your cart is empty';

  @override
  String get startShopping => 'Start shopping';

  @override
  String get cartLoadError => 'Couldn\'t load your cart.';

  @override
  String get couponCode => 'Coupon code';

  @override
  String get apply => 'Apply';

  @override
  String get remove => 'Remove';

  @override
  String get subtotal => 'Subtotal';

  @override
  String get discount => 'Discount';

  @override
  String get taxesFeesAtCheckout => 'Taxes and fees calculated at checkout.';

  @override
  String get proceedToCheckout => 'Proceed to checkout';

  @override
  String get selectAll => 'All';

  @override
  String arrivalEstimate(int min, int max) {
    return 'Arrives in $min–$max days';
  }

  @override
  String arrivalEstimateSingle(int days) {
    return 'Arrives in $days days';
  }

  @override
  String get removeFromCart => 'Remove from cart?';

  @override
  String get removeFromCartMessage =>
      'This item will be removed from your cart.';

  @override
  String selectedItemsCount(int count, int total) {
    return '$count of $total selected';
  }

  @override
  String get reviewOrder => 'Review order';

  @override
  String get useThisAddress => 'Use this address';

  @override
  String get updateRequiredTitle => 'Update required';

  @override
  String get updateRequiredBody =>
      'This version of the app is no longer supported. Please update to continue.';

  @override
  String get updateAvailableTitle => 'Update available';

  @override
  String get updateAvailableBody => 'A newer version of the app is available.';

  @override
  String get updateNow => 'Update now';

  @override
  String get notNow => 'Not now';

  @override
  String get selectAddress => 'Select address';

  @override
  String get noAddressForCheckout => 'You need a delivery address to continue.';

  @override
  String get addAnotherAddress => 'Add another address';

  @override
  String get continueToReview => 'Continue';

  @override
  String get checkout => 'Checkout';

  @override
  String get deliveryAddress => 'Delivery address';

  @override
  String get change => 'Change';

  @override
  String get orderItems => 'Items';

  @override
  String get notesOptional => 'Notes (optional)';

  @override
  String get notesHint => 'Any delivery instructions?';

  @override
  String get paymentMethod => 'Payment method';

  @override
  String get orderSummary => 'Order summary';

  @override
  String get tax => 'Tax';

  @override
  String get fees => 'Fees';

  @override
  String get shipping => 'Shipping';

  @override
  String get total => 'Total';

  @override
  String get placeOrder => 'Place order';

  @override
  String get orderPlaced => 'Order placed!';

  @override
  String get orderPlacedSubtitle =>
      'Thank you. We\'ve received your order and will contact you to confirm.';

  @override
  String get orderNumber => 'Order number';

  @override
  String get continueShopping => 'Continue shopping';

  @override
  String get payCod => 'Cash on delivery';

  @override
  String get payZainCash => 'Zain Cash';

  @override
  String get payFib => 'FIB';

  @override
  String get payTransfer => 'Bank transfer';

  @override
  String get payCard => 'Card';

  @override
  String get payWallet => 'Wallet';

  @override
  String get addedToCart => 'Added to cart';

  @override
  String get addToCart => 'Add to cart';

  @override
  String get outOfStock => 'Out of stock';

  @override
  String get options => 'Options';

  @override
  String get productDescription => 'Description';

  @override
  String reviewsCount(int count) {
    return '$count reviews';
  }

  @override
  String get productLoadError => 'Couldn\'t load this product.';

  @override
  String get addedToFavorites => 'Added to favorites';

  @override
  String get removedFromFavorites => 'Removed from favorites';

  @override
  String get myFavorites => 'My favorites';

  @override
  String get noFavoritesYet => 'No favorites yet';

  @override
  String get favoritesHint => 'Tap the heart on a product to save it here.';

  @override
  String get favoritesLoadError => 'Couldn\'t load your favorites.';

  @override
  String get myOrders => 'My orders';

  @override
  String get orderDetailTitle => 'Order details';

  @override
  String get noOrdersYet => 'No orders yet';

  @override
  String get ordersHint => 'Your placed orders will appear here.';

  @override
  String get ordersLoadError => 'Couldn\'t load your orders.';

  @override
  String get orderLoadError => 'Couldn\'t load this order.';

  @override
  String itemsCount(int count) {
    return '$count items';
  }

  @override
  String get trackingNumber => 'Tracking number';

  @override
  String get notes => 'Notes';

  @override
  String get viewMyOrders => 'View my orders';

  @override
  String get orderStatusPending => 'Pending';

  @override
  String get orderStatusPaid => 'Paid';

  @override
  String get orderStatusProcessing => 'Processing';

  @override
  String get orderStatusShipped => 'Shipped';

  @override
  String get orderStatusOutForDelivery => 'Out for delivery';

  @override
  String get orderStatusDelivered => 'Delivered';

  @override
  String get orderStatusCancelled => 'Cancelled';

  @override
  String get orderStatusRefunded => 'Refunded';

  @override
  String get payStatusPending => 'Pending';

  @override
  String get payStatusPaid => 'Paid';

  @override
  String get payStatusFailed => 'Failed';

  @override
  String get payStatusRefunded => 'Refunded';

  @override
  String get tabProducts => 'Products';

  @override
  String get tabAssistant => 'Assistant';

  @override
  String get searchProducts => 'Search products';

  @override
  String get stores => 'Stores';

  @override
  String get storesLoadError => 'Couldn\'t load stores.';

  @override
  String get noResults => 'No results';

  @override
  String resultsCount(int count) {
    return '$count results';
  }

  @override
  String get filters => 'Filters';

  @override
  String get reset => 'Reset';

  @override
  String get sortBy => 'Sort by';

  @override
  String get sortNewest => 'Newest';

  @override
  String get sortPriceAsc => 'Price: low to high';

  @override
  String get sortPriceDesc => 'Price: high to low';

  @override
  String get sortRating => 'Top rated';

  @override
  String get priceRange => 'Price range';

  @override
  String get minPrice => 'Min';

  @override
  String get maxPrice => 'Max';

  @override
  String get inStockOnly => 'In stock only';

  @override
  String get applyFilters => 'Apply filters';

  @override
  String get assistantTitle => 'Shopping assistant';

  @override
  String get assistantComingSoon =>
      'Your AI shopping assistant is coming soon.';

  @override
  String get assistantEmptyTitle => 'How can I help?';

  @override
  String get assistantEmptyBody =>
      'Ask me to find products, compare options, or get recommendations.';

  @override
  String get assistantInputHint => 'Ask about products…';

  @override
  String get assistantUnavailable =>
      'The assistant isn\'t available right now. Please try again later.';

  @override
  String get assistantError => 'Something went wrong. Please try again.';

  @override
  String get assistantNewChat => 'New chat';

  @override
  String get assistantGuestCta => 'Try our skincare assistant';

  @override
  String assistantGuestRemaining(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count free messages left',
      one: '1 free message left',
    );
    return '$_temp0';
  }

  @override
  String get assistantGuestWallTitle => 'Log in to keep chatting';

  @override
  String get assistantGuestWallBody =>
      'You\'ve used your free messages. Log in or create an account to continue your consultation.';

  @override
  String get editProfile => 'Edit profile';

  @override
  String get changePassword => 'Change password';

  @override
  String get preferences => 'Preferences';

  @override
  String get theme => 'Theme';

  @override
  String get saveChanges => 'Save changes';

  @override
  String get changePhoto => 'Change photo';

  @override
  String get currentPassword => 'Current password';

  @override
  String get confirmPassword => 'Confirm new password';

  @override
  String get passwordsDontMatch => 'Passwords don\'t match.';

  @override
  String get passwordChanged => 'Password changed.';

  @override
  String get profileUpdated => 'Profile updated.';

  @override
  String get avatarUpdated => 'Photo updated.';

  @override
  String get nameRequired => 'Name is required.';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get fillAllFields => 'Please fill in all fields.';

  @override
  String get passwordTooShort => 'Password must be at least 8 characters.';

  @override
  String productsCount(int count) {
    return '$count products';
  }

  @override
  String get notifications => 'Notifications';

  @override
  String get notifMarkAllRead => 'Mark all read';

  @override
  String get noNotificationsYet => 'No notifications yet';

  @override
  String get notificationsHint => 'Updates about your orders will appear here.';

  @override
  String get notificationsLoadError => 'Couldn\'t load your notifications.';

  @override
  String get notifOrderPlacedTitle => 'Order placed';

  @override
  String notifOrderPlacedBody(String number) {
    return 'Your order $number has been placed.';
  }

  @override
  String get notifOrderUpdateTitle => 'Order update';

  @override
  String notifOrderStatusBody(String number, String status) {
    return 'Order $number is now $status.';
  }
}
