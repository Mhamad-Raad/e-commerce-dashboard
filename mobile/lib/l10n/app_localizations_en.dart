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
  String productsCount(int count) {
    return '$count products';
  }
}
