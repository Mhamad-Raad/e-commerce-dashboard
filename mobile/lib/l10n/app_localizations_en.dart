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
  String productsCount(int count) {
    return '$count products';
  }
}
