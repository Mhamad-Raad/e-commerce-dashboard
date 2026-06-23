import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_ckb.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('ckb'),
    Locale('en'),
  ];

  /// No description provided for @brandName.
  ///
  /// In en, this message translates to:
  /// **'Rozhna\'s Store'**
  String get brandName;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Log in to continue'**
  String get loginSubtitle;

  /// No description provided for @phoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get phoneNumber;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get forgotPassword;

  /// No description provided for @logIn.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get logIn;

  /// No description provided for @newHere.
  ///
  /// In en, this message translates to:
  /// **'New here?'**
  String get newHere;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get createAccount;

  /// No description provided for @enterPhoneAndPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter your phone number and password.'**
  String get enterPhoneAndPassword;

  /// No description provided for @verifyToContinue.
  ///
  /// In en, this message translates to:
  /// **'Verify your number to continue — we sent a code.'**
  String get verifyToContinue;

  /// No description provided for @createYourAccount.
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get createYourAccount;

  /// No description provided for @fullName.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get fullName;

  /// No description provided for @emailOptional.
  ///
  /// In en, this message translates to:
  /// **'Email (optional)'**
  String get emailOptional;

  /// No description provided for @passwordMin8.
  ///
  /// In en, this message translates to:
  /// **'Password (min 8 characters)'**
  String get passwordMin8;

  /// No description provided for @namePhonePasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Name, phone and password are required.'**
  String get namePhonePasswordRequired;

  /// No description provided for @numberAlreadyRegistered.
  ///
  /// In en, this message translates to:
  /// **'This number already has an account. Please log in.'**
  String get numberAlreadyRegistered;

  /// No description provided for @verifyYourNumber.
  ///
  /// In en, this message translates to:
  /// **'Verify your number'**
  String get verifyYourNumber;

  /// No description provided for @otpSentTo.
  ///
  /// In en, this message translates to:
  /// **'Enter the code we sent on WhatsApp to {phone}.'**
  String otpSentTo(String phone);

  /// No description provided for @verificationCode.
  ///
  /// In en, this message translates to:
  /// **'Verification code'**
  String get verificationCode;

  /// No description provided for @verify.
  ///
  /// In en, this message translates to:
  /// **'Verify'**
  String get verify;

  /// No description provided for @resendCode.
  ///
  /// In en, this message translates to:
  /// **'Didn\'t get it? Resend code'**
  String get resendCode;

  /// No description provided for @newCodeSent.
  ///
  /// In en, this message translates to:
  /// **'A new code is on its way.'**
  String get newCodeSent;

  /// No description provided for @enterTheCode.
  ///
  /// In en, this message translates to:
  /// **'Enter the code we sent you.'**
  String get enterTheCode;

  /// No description provided for @resetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset password'**
  String get resetPassword;

  /// No description provided for @forgotSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter your phone number and we\'ll send a reset code on WhatsApp.'**
  String get forgotSubtitle;

  /// No description provided for @sendCode.
  ///
  /// In en, this message translates to:
  /// **'Send code'**
  String get sendCode;

  /// No description provided for @enterPhone.
  ///
  /// In en, this message translates to:
  /// **'Enter your phone number.'**
  String get enterPhone;

  /// No description provided for @ifRegisteredCodeSent.
  ///
  /// In en, this message translates to:
  /// **'If the number is registered, a code was sent.'**
  String get ifRegisteredCodeSent;

  /// No description provided for @newPasswordTitle.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get newPasswordTitle;

  /// No description provided for @newPasswordSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter the code we sent and choose a new password.'**
  String get newPasswordSubtitle;

  /// No description provided for @resetCode.
  ///
  /// In en, this message translates to:
  /// **'Reset code'**
  String get resetCode;

  /// No description provided for @newPasswordMin8.
  ///
  /// In en, this message translates to:
  /// **'New password (min 8 characters)'**
  String get newPasswordMin8;

  /// No description provided for @savePassword.
  ///
  /// In en, this message translates to:
  /// **'Save password'**
  String get savePassword;

  /// No description provided for @fillCodeAndPassword.
  ///
  /// In en, this message translates to:
  /// **'Fill in the code and your new password.'**
  String get fillCodeAndPassword;

  /// No description provided for @passwordUpdated.
  ///
  /// In en, this message translates to:
  /// **'Password updated. Please log in.'**
  String get passwordUpdated;

  /// No description provided for @logOut.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get logOut;

  /// No description provided for @tabHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get tabHome;

  /// No description provided for @tabShop.
  ///
  /// In en, this message translates to:
  /// **'Shop'**
  String get tabShop;

  /// No description provided for @tabSearch.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get tabSearch;

  /// No description provided for @tabProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get tabProfile;

  /// No description provided for @categoriesTitle.
  ///
  /// In en, this message translates to:
  /// **'Categories'**
  String get categoriesTitle;

  /// No description provided for @featuredTitle.
  ///
  /// In en, this message translates to:
  /// **'Featured'**
  String get featuredTitle;

  /// No description provided for @shopsTitle.
  ///
  /// In en, this message translates to:
  /// **'Shops'**
  String get shopsTitle;

  /// No description provided for @seeAll.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get seeAll;

  /// No description provided for @homeLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load the home page.'**
  String get homeLoadError;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @comingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming soon'**
  String get comingSoon;

  /// No description provided for @toggleTheme.
  ///
  /// In en, this message translates to:
  /// **'Toggle theme'**
  String get toggleTheme;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @account.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get account;

  /// No description provided for @myAddresses.
  ///
  /// In en, this message translates to:
  /// **'My addresses'**
  String get myAddresses;

  /// No description provided for @addAddress.
  ///
  /// In en, this message translates to:
  /// **'Add address'**
  String get addAddress;

  /// No description provided for @editAddress.
  ///
  /// In en, this message translates to:
  /// **'Edit address'**
  String get editAddress;

  /// No description provided for @noAddressesYet.
  ///
  /// In en, this message translates to:
  /// **'No addresses yet'**
  String get noAddressesYet;

  /// No description provided for @addAddressHint.
  ///
  /// In en, this message translates to:
  /// **'Add a delivery address so we know where to ship your orders.'**
  String get addAddressHint;

  /// No description provided for @addressLabel.
  ///
  /// In en, this message translates to:
  /// **'Label (e.g. Home, Work)'**
  String get addressLabel;

  /// No description provided for @addressFallbackLabel.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get addressFallbackLabel;

  /// No description provided for @governorate.
  ///
  /// In en, this message translates to:
  /// **'Governorate'**
  String get governorate;

  /// No description provided for @city.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get city;

  /// No description provided for @district.
  ///
  /// In en, this message translates to:
  /// **'District'**
  String get district;

  /// No description provided for @street.
  ///
  /// In en, this message translates to:
  /// **'Street'**
  String get street;

  /// No description provided for @nearestLandmark.
  ///
  /// In en, this message translates to:
  /// **'Nearest landmark'**
  String get nearestLandmark;

  /// No description provided for @contactPhone.
  ///
  /// In en, this message translates to:
  /// **'Contact phone'**
  String get contactPhone;

  /// No description provided for @setAsDefault.
  ///
  /// In en, this message translates to:
  /// **'Set as default'**
  String get setAsDefault;

  /// No description provided for @defaultBadge.
  ///
  /// In en, this message translates to:
  /// **'Default'**
  String get defaultBadge;

  /// No description provided for @saveAddress.
  ///
  /// In en, this message translates to:
  /// **'Save address'**
  String get saveAddress;

  /// No description provided for @selectGovernorate.
  ///
  /// In en, this message translates to:
  /// **'Select a governorate'**
  String get selectGovernorate;

  /// No description provided for @selectCity.
  ///
  /// In en, this message translates to:
  /// **'Select a city'**
  String get selectCity;

  /// No description provided for @governorateCityRequired.
  ///
  /// In en, this message translates to:
  /// **'Please choose a governorate and city.'**
  String get governorateCityRequired;

  /// No description provided for @deleteAddress.
  ///
  /// In en, this message translates to:
  /// **'Delete address'**
  String get deleteAddress;

  /// No description provided for @deleteAddressConfirm.
  ///
  /// In en, this message translates to:
  /// **'Delete this address?'**
  String get deleteAddressConfirm;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @addressDeleted.
  ///
  /// In en, this message translates to:
  /// **'Address deleted.'**
  String get addressDeleted;

  /// No description provided for @addressesLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load your addresses.'**
  String get addressesLoadError;

  /// No description provided for @makeDefault.
  ///
  /// In en, this message translates to:
  /// **'Make default'**
  String get makeDefault;

  /// No description provided for @cartTitle.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get cartTitle;

  /// No description provided for @cartEmpty.
  ///
  /// In en, this message translates to:
  /// **'Your cart is empty'**
  String get cartEmpty;

  /// No description provided for @startShopping.
  ///
  /// In en, this message translates to:
  /// **'Start shopping'**
  String get startShopping;

  /// No description provided for @cartLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load your cart.'**
  String get cartLoadError;

  /// No description provided for @couponCode.
  ///
  /// In en, this message translates to:
  /// **'Coupon code'**
  String get couponCode;

  /// No description provided for @apply.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get apply;

  /// No description provided for @remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// No description provided for @subtotal.
  ///
  /// In en, this message translates to:
  /// **'Subtotal'**
  String get subtotal;

  /// No description provided for @discount.
  ///
  /// In en, this message translates to:
  /// **'Discount'**
  String get discount;

  /// No description provided for @taxesFeesAtCheckout.
  ///
  /// In en, this message translates to:
  /// **'Taxes and fees calculated at checkout.'**
  String get taxesFeesAtCheckout;

  /// No description provided for @proceedToCheckout.
  ///
  /// In en, this message translates to:
  /// **'Proceed to checkout'**
  String get proceedToCheckout;

  /// No description provided for @selectAddress.
  ///
  /// In en, this message translates to:
  /// **'Select address'**
  String get selectAddress;

  /// No description provided for @noAddressForCheckout.
  ///
  /// In en, this message translates to:
  /// **'You need a delivery address to continue.'**
  String get noAddressForCheckout;

  /// No description provided for @addAnotherAddress.
  ///
  /// In en, this message translates to:
  /// **'Add another address'**
  String get addAnotherAddress;

  /// No description provided for @continueToReview.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueToReview;

  /// No description provided for @checkout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get checkout;

  /// No description provided for @deliveryAddress.
  ///
  /// In en, this message translates to:
  /// **'Delivery address'**
  String get deliveryAddress;

  /// No description provided for @change.
  ///
  /// In en, this message translates to:
  /// **'Change'**
  String get change;

  /// No description provided for @orderItems.
  ///
  /// In en, this message translates to:
  /// **'Items'**
  String get orderItems;

  /// No description provided for @notesOptional.
  ///
  /// In en, this message translates to:
  /// **'Notes (optional)'**
  String get notesOptional;

  /// No description provided for @notesHint.
  ///
  /// In en, this message translates to:
  /// **'Any delivery instructions?'**
  String get notesHint;

  /// No description provided for @paymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment method'**
  String get paymentMethod;

  /// No description provided for @orderSummary.
  ///
  /// In en, this message translates to:
  /// **'Order summary'**
  String get orderSummary;

  /// No description provided for @tax.
  ///
  /// In en, this message translates to:
  /// **'Tax'**
  String get tax;

  /// No description provided for @fees.
  ///
  /// In en, this message translates to:
  /// **'Fees'**
  String get fees;

  /// No description provided for @shipping.
  ///
  /// In en, this message translates to:
  /// **'Shipping'**
  String get shipping;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @placeOrder.
  ///
  /// In en, this message translates to:
  /// **'Place order'**
  String get placeOrder;

  /// No description provided for @orderPlaced.
  ///
  /// In en, this message translates to:
  /// **'Order placed!'**
  String get orderPlaced;

  /// No description provided for @orderPlacedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Thank you. We\'ve received your order and will contact you to confirm.'**
  String get orderPlacedSubtitle;

  /// No description provided for @orderNumber.
  ///
  /// In en, this message translates to:
  /// **'Order number'**
  String get orderNumber;

  /// No description provided for @continueShopping.
  ///
  /// In en, this message translates to:
  /// **'Continue shopping'**
  String get continueShopping;

  /// No description provided for @payCod.
  ///
  /// In en, this message translates to:
  /// **'Cash on delivery'**
  String get payCod;

  /// No description provided for @payZainCash.
  ///
  /// In en, this message translates to:
  /// **'Zain Cash'**
  String get payZainCash;

  /// No description provided for @payFib.
  ///
  /// In en, this message translates to:
  /// **'FIB'**
  String get payFib;

  /// No description provided for @payTransfer.
  ///
  /// In en, this message translates to:
  /// **'Bank transfer'**
  String get payTransfer;

  /// No description provided for @payCard.
  ///
  /// In en, this message translates to:
  /// **'Card'**
  String get payCard;

  /// No description provided for @payWallet.
  ///
  /// In en, this message translates to:
  /// **'Wallet'**
  String get payWallet;

  /// No description provided for @addedToCart.
  ///
  /// In en, this message translates to:
  /// **'Added to cart'**
  String get addedToCart;

  /// No description provided for @productsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} products'**
  String productsCount(int count);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'ckb', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'ckb':
      return AppLocalizationsCkb();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
