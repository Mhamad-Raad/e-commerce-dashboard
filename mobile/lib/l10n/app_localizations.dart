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

  /// No description provided for @gender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get gender;

  /// No description provided for @genderFemale.
  ///
  /// In en, this message translates to:
  /// **'Female'**
  String get genderFemale;

  /// No description provided for @genderMale.
  ///
  /// In en, this message translates to:
  /// **'Male'**
  String get genderMale;

  /// No description provided for @genderRequired.
  ///
  /// In en, this message translates to:
  /// **'Please select your gender.'**
  String get genderRequired;

  /// No description provided for @routineReminderTitle.
  ///
  /// In en, this message translates to:
  /// **'Your skincare moment ✨'**
  String get routineReminderTitle;

  /// No description provided for @routineReminderBody.
  ///
  /// In en, this message translates to:
  /// **'Have you done your routine today? Tap for a quick check-in.'**
  String get routineReminderBody;

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

  /// No description provided for @linkOpenError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t open the link.'**
  String get linkOpenError;

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

  /// No description provided for @selectAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get selectAll;

  /// No description provided for @arrivalEstimate.
  ///
  /// In en, this message translates to:
  /// **'Arrives in {min}–{max} days'**
  String arrivalEstimate(String min, String max);

  /// No description provided for @arrivalEstimateSingle.
  ///
  /// In en, this message translates to:
  /// **'Arrives in {days} days'**
  String arrivalEstimateSingle(String days);

  /// No description provided for @removeFromCart.
  ///
  /// In en, this message translates to:
  /// **'Remove from cart?'**
  String get removeFromCart;

  /// No description provided for @removeFromCartMessage.
  ///
  /// In en, this message translates to:
  /// **'This item will be removed from your cart.'**
  String get removeFromCartMessage;

  /// No description provided for @selectedItemsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} of {total} selected'**
  String selectedItemsCount(String count, String total);

  /// No description provided for @reviewOrder.
  ///
  /// In en, this message translates to:
  /// **'Review order'**
  String get reviewOrder;

  /// No description provided for @useThisAddress.
  ///
  /// In en, this message translates to:
  /// **'Use this address'**
  String get useThisAddress;

  /// No description provided for @updateRequiredTitle.
  ///
  /// In en, this message translates to:
  /// **'Update required'**
  String get updateRequiredTitle;

  /// No description provided for @updateRequiredBody.
  ///
  /// In en, this message translates to:
  /// **'This version of the app is no longer supported. Please update to continue.'**
  String get updateRequiredBody;

  /// No description provided for @updateAvailableTitle.
  ///
  /// In en, this message translates to:
  /// **'Update available'**
  String get updateAvailableTitle;

  /// No description provided for @updateAvailableBody.
  ///
  /// In en, this message translates to:
  /// **'A newer version of the app is available.'**
  String get updateAvailableBody;

  /// No description provided for @updateNow.
  ///
  /// In en, this message translates to:
  /// **'Update now'**
  String get updateNow;

  /// No description provided for @notNow.
  ///
  /// In en, this message translates to:
  /// **'Not now'**
  String get notNow;

  /// No description provided for @resendCodeIn.
  ///
  /// In en, this message translates to:
  /// **'Resend code ({seconds}s)'**
  String resendCodeIn(String seconds);

  /// No description provided for @accountInformation.
  ///
  /// In en, this message translates to:
  /// **'Account information'**
  String get accountInformation;

  /// No description provided for @contactInformation.
  ///
  /// In en, this message translates to:
  /// **'Contact information'**
  String get contactInformation;

  /// No description provided for @security.
  ///
  /// In en, this message translates to:
  /// **'Security'**
  String get security;

  /// No description provided for @emailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address.'**
  String get emailInvalid;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete account'**
  String get deleteAccount;

  /// No description provided for @deleteAccountConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete your account?'**
  String get deleteAccountConfirmTitle;

  /// No description provided for @deleteAccountConfirmBody.
  ///
  /// In en, this message translates to:
  /// **'Your account will be deactivated and you will be signed out. Contact support if you change your mind.'**
  String get deleteAccountConfirmBody;

  /// No description provided for @supportSection.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get supportSection;

  /// No description provided for @aboutTitle.
  ///
  /// In en, this message translates to:
  /// **'About us'**
  String get aboutTitle;

  /// No description provided for @aboutIntro.
  ///
  /// In en, this message translates to:
  /// **'Authentic beauty, delivered to every corner of Iraq.'**
  String get aboutIntro;

  /// No description provided for @aboutStoryTitle.
  ///
  /// In en, this message translates to:
  /// **'Our story'**
  String get aboutStoryTitle;

  /// No description provided for @aboutBody1.
  ///
  /// In en, this message translates to:
  /// **'Rozhna\'s Store started with a simple belief: everyone in Iraq deserves genuine beauty and skincare products without worrying about fakes or inflated prices.'**
  String get aboutBody1;

  /// No description provided for @aboutBody2.
  ///
  /// In en, this message translates to:
  /// **'Today we bring trusted brands together in one place, with clear prices in Iraqi dinar, delivery to every governorate, and a team that treats your order like its own.'**
  String get aboutBody2;

  /// No description provided for @aboutWhyTitle.
  ///
  /// In en, this message translates to:
  /// **'Why choose us'**
  String get aboutWhyTitle;

  /// No description provided for @aboutFeature1Title.
  ///
  /// In en, this message translates to:
  /// **'100% authentic'**
  String get aboutFeature1Title;

  /// No description provided for @aboutFeature1Body.
  ///
  /// In en, this message translates to:
  /// **'Every product is sourced from trusted suppliers — originals only, always.'**
  String get aboutFeature1Body;

  /// No description provided for @aboutFeature2Title.
  ///
  /// In en, this message translates to:
  /// **'Nationwide delivery'**
  String get aboutFeature2Title;

  /// No description provided for @aboutFeature2Body.
  ///
  /// In en, this message translates to:
  /// **'We deliver to all of Iraq\'s governorates, with clear arrival estimates before you order.'**
  String get aboutFeature2Body;

  /// No description provided for @aboutFeature3Title.
  ///
  /// In en, this message translates to:
  /// **'Real support'**
  String get aboutFeature3Title;

  /// No description provided for @aboutFeature3Body.
  ///
  /// In en, this message translates to:
  /// **'Questions before or after your order? Our team is a call or message away.'**
  String get aboutFeature3Body;

  /// No description provided for @faqTitle.
  ///
  /// In en, this message translates to:
  /// **'FAQ'**
  String get faqTitle;

  /// No description provided for @faqSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Quick answers to the questions we hear most.'**
  String get faqSubtitle;

  /// No description provided for @faqQ1.
  ///
  /// In en, this message translates to:
  /// **'How long does delivery take?'**
  String get faqQ1;

  /// No description provided for @faqA1.
  ///
  /// In en, this message translates to:
  /// **'Most orders arrive within 3–7 days depending on your governorate. Each store shows its estimated arrival time in your cart before you order.'**
  String get faqA1;

  /// No description provided for @faqQ2.
  ///
  /// In en, this message translates to:
  /// **'What payment methods can I use?'**
  String get faqQ2;

  /// No description provided for @faqA2.
  ///
  /// In en, this message translates to:
  /// **'Cash on delivery, Zain Cash, FIB, bank transfer, and more — pick what suits you at checkout.'**
  String get faqA2;

  /// No description provided for @faqQ3.
  ///
  /// In en, this message translates to:
  /// **'Are your products original?'**
  String get faqQ3;

  /// No description provided for @faqA3.
  ///
  /// In en, this message translates to:
  /// **'Yes. We source every brand from trusted suppliers and guarantee authenticity.'**
  String get faqA3;

  /// No description provided for @faqQ4.
  ///
  /// In en, this message translates to:
  /// **'Can I return or exchange an item?'**
  String get faqQ4;

  /// No description provided for @faqA4.
  ///
  /// In en, this message translates to:
  /// **'If your item arrives damaged or incorrect, contact us within 3 days of delivery and we\'ll make it right.'**
  String get faqA4;

  /// No description provided for @faqQ5.
  ///
  /// In en, this message translates to:
  /// **'How do I track my order?'**
  String get faqQ5;

  /// No description provided for @faqA5.
  ///
  /// In en, this message translates to:
  /// **'Open My Orders to follow your order\'s status. We\'ll also send you a notification at every step.'**
  String get faqA5;

  /// No description provided for @contactTitle.
  ///
  /// In en, this message translates to:
  /// **'Contact us'**
  String get contactTitle;

  /// No description provided for @contactSubtitle.
  ///
  /// In en, this message translates to:
  /// **'We\'re happy to help — reach us on any of these.'**
  String get contactSubtitle;

  /// No description provided for @contactCall.
  ///
  /// In en, this message translates to:
  /// **'Call us'**
  String get contactCall;

  /// No description provided for @contactWhatsApp.
  ///
  /// In en, this message translates to:
  /// **'WhatsApp'**
  String get contactWhatsApp;

  /// No description provided for @contactEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get contactEmail;

  /// No description provided for @contactAddress.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get contactAddress;

  /// No description provided for @contactLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load contact details.'**
  String get contactLoadError;

  /// No description provided for @privacyTitle.
  ///
  /// In en, this message translates to:
  /// **'Privacy policy'**
  String get privacyTitle;

  /// No description provided for @privacyBody.
  ///
  /// In en, this message translates to:
  /// **'We collect only what we need to serve you: your name, phone number, delivery addresses, and order history. Your phone number is used to secure your account and coordinate deliveries.\n\nWe never sell your personal information to third parties. Order details are shared only with the people who deliver your packages.\n\nYour data is stored securely, and payments are settled on delivery or through the payment method you choose — we do not store card numbers.\n\nYou can update your information anytime from your profile, and you can request account deletion from the Edit Profile screen or by contacting support.'**
  String get privacyBody;

  /// No description provided for @termsTitle.
  ///
  /// In en, this message translates to:
  /// **'Terms of use'**
  String get termsTitle;

  /// No description provided for @termsBody.
  ///
  /// In en, this message translates to:
  /// **'By using this app you agree to these terms.\n\nOrders: placing an order is an offer to purchase; items are subject to availability and confirmation. Prices are shown in Iraqi dinar and may change until your order is confirmed.\n\nDelivery: estimated arrival times are estimates, not guarantees. Please provide accurate address and contact details — repeated failed deliveries may limit cash-on-delivery availability.\n\nAccounts: you are responsible for keeping your login details safe. We may suspend accounts that abuse the service or attempt fraud.\n\nReturns: contact us within 3 days of delivery for damaged or incorrect items.\n\nThese terms may be updated from time to time; continued use means you accept the latest version.'**
  String get termsBody;

  /// No description provided for @returnPolicyTitle.
  ///
  /// In en, this message translates to:
  /// **'Returns & exchanges'**
  String get returnPolicyTitle;

  /// No description provided for @returnPolicyBody.
  ///
  /// In en, this message translates to:
  /// **'We want you to love every order — and when something goes wrong, we make it right.\n\nDamaged or incorrect items: if your order arrives damaged, defective, or different from what you ordered, contact us within 3 days of delivery and we will exchange it or refund you, delivery included.\n\nHow to request a return: reach us through Contact us (call, WhatsApp, or email) with your order number and clear photos of the item and its packaging. Our team will confirm the next steps with you.\n\nCondition: items must be unused and in their original packaging. For hygiene and safety, opened beauty and skincare products can only be returned if they arrived damaged or incorrect.\n\nRefunds: once your return is approved, cash-on-delivery payments are refunded by money transfer, and other payment methods are refunded the way you paid. Refunds are issued within a few days of us receiving the returned item.'**
  String get returnPolicyBody;

  /// No description provided for @shippingPolicyTitle.
  ///
  /// In en, this message translates to:
  /// **'Shipping & delivery'**
  String get shippingPolicyTitle;

  /// No description provided for @shippingPolicyBody.
  ///
  /// In en, this message translates to:
  /// **'We deliver to every governorate in Iraq.\n\nDelivery time: most orders arrive within 3–7 days depending on your governorate. Each store shows an estimated arrival window in your cart before you place your order.\n\nDelivery fees: any delivery fee is shown clearly at checkout, before you confirm — no surprises at the door.\n\nTracking: follow your order\'s status anytime from My Orders. We also send you a notification at every step, and our courier will call you before delivery.\n\nReceiving your order: please make sure your address and phone number are correct and reachable. If we can\'t reach you, we\'ll try again or contact you to reschedule. You can update your addresses anytime from your profile.'**
  String get shippingPolicyBody;

  /// No description provided for @signupAgreeNotice.
  ///
  /// In en, this message translates to:
  /// **'By creating an account you agree to our {terms} and {privacy}.'**
  String signupAgreeNotice(String terms, String privacy);

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

  /// No description provided for @addToCart.
  ///
  /// In en, this message translates to:
  /// **'Add to cart'**
  String get addToCart;

  /// No description provided for @outOfStock.
  ///
  /// In en, this message translates to:
  /// **'Out of stock'**
  String get outOfStock;

  /// No description provided for @options.
  ///
  /// In en, this message translates to:
  /// **'Options'**
  String get options;

  /// No description provided for @productDescription.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get productDescription;

  /// No description provided for @reviewsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} reviews'**
  String reviewsCount(String count);

  /// No description provided for @productLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load this product.'**
  String get productLoadError;

  /// No description provided for @addedToFavorites.
  ///
  /// In en, this message translates to:
  /// **'Added to favorites'**
  String get addedToFavorites;

  /// No description provided for @removedFromFavorites.
  ///
  /// In en, this message translates to:
  /// **'Removed from favorites'**
  String get removedFromFavorites;

  /// No description provided for @myFavorites.
  ///
  /// In en, this message translates to:
  /// **'My favorites'**
  String get myFavorites;

  /// No description provided for @noFavoritesYet.
  ///
  /// In en, this message translates to:
  /// **'No favorites yet'**
  String get noFavoritesYet;

  /// No description provided for @favoritesHint.
  ///
  /// In en, this message translates to:
  /// **'Tap the heart on a product to save it here.'**
  String get favoritesHint;

  /// No description provided for @favoritesLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load your favorites.'**
  String get favoritesLoadError;

  /// No description provided for @myOrders.
  ///
  /// In en, this message translates to:
  /// **'My orders'**
  String get myOrders;

  /// No description provided for @orderDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Order details'**
  String get orderDetailTitle;

  /// No description provided for @noOrdersYet.
  ///
  /// In en, this message translates to:
  /// **'No orders yet'**
  String get noOrdersYet;

  /// No description provided for @ordersHint.
  ///
  /// In en, this message translates to:
  /// **'Your placed orders will appear here.'**
  String get ordersHint;

  /// No description provided for @ordersLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load your orders.'**
  String get ordersLoadError;

  /// No description provided for @orderLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load this order.'**
  String get orderLoadError;

  /// No description provided for @itemsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} items'**
  String itemsCount(String count);

  /// No description provided for @trackingNumber.
  ///
  /// In en, this message translates to:
  /// **'Tracking number'**
  String get trackingNumber;

  /// No description provided for @notes.
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get notes;

  /// No description provided for @viewMyOrders.
  ///
  /// In en, this message translates to:
  /// **'View my orders'**
  String get viewMyOrders;

  /// No description provided for @orderStatusPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get orderStatusPending;

  /// No description provided for @orderStatusPaid.
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get orderStatusPaid;

  /// No description provided for @orderStatusProcessing.
  ///
  /// In en, this message translates to:
  /// **'Processing'**
  String get orderStatusProcessing;

  /// No description provided for @orderStatusShipped.
  ///
  /// In en, this message translates to:
  /// **'Shipped'**
  String get orderStatusShipped;

  /// No description provided for @orderStatusOutForDelivery.
  ///
  /// In en, this message translates to:
  /// **'Out for delivery'**
  String get orderStatusOutForDelivery;

  /// No description provided for @orderStatusDelivered.
  ///
  /// In en, this message translates to:
  /// **'Delivered'**
  String get orderStatusDelivered;

  /// No description provided for @orderStatusCancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get orderStatusCancelled;

  /// No description provided for @orderStatusRefunded.
  ///
  /// In en, this message translates to:
  /// **'Refunded'**
  String get orderStatusRefunded;

  /// No description provided for @payStatusPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get payStatusPending;

  /// No description provided for @payStatusPaid.
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get payStatusPaid;

  /// No description provided for @payStatusFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed'**
  String get payStatusFailed;

  /// No description provided for @payStatusRefunded.
  ///
  /// In en, this message translates to:
  /// **'Refunded'**
  String get payStatusRefunded;

  /// No description provided for @tabProducts.
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get tabProducts;

  /// No description provided for @tabAssistant.
  ///
  /// In en, this message translates to:
  /// **'Assistant'**
  String get tabAssistant;

  /// No description provided for @searchProducts.
  ///
  /// In en, this message translates to:
  /// **'Search products'**
  String get searchProducts;

  /// No description provided for @stores.
  ///
  /// In en, this message translates to:
  /// **'Stores'**
  String get stores;

  /// No description provided for @storesLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load stores.'**
  String get storesLoadError;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No results'**
  String get noResults;

  /// No description provided for @resultsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} results'**
  String resultsCount(String count);

  /// No description provided for @filters.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get filters;

  /// No description provided for @reset.
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get reset;

  /// No description provided for @sortBy.
  ///
  /// In en, this message translates to:
  /// **'Sort by'**
  String get sortBy;

  /// No description provided for @sortNewest.
  ///
  /// In en, this message translates to:
  /// **'Newest'**
  String get sortNewest;

  /// No description provided for @sortPriceAsc.
  ///
  /// In en, this message translates to:
  /// **'Price: low to high'**
  String get sortPriceAsc;

  /// No description provided for @sortPriceDesc.
  ///
  /// In en, this message translates to:
  /// **'Price: high to low'**
  String get sortPriceDesc;

  /// No description provided for @sortRating.
  ///
  /// In en, this message translates to:
  /// **'Top rated'**
  String get sortRating;

  /// No description provided for @priceRange.
  ///
  /// In en, this message translates to:
  /// **'Price range'**
  String get priceRange;

  /// No description provided for @minPrice.
  ///
  /// In en, this message translates to:
  /// **'Min'**
  String get minPrice;

  /// No description provided for @maxPrice.
  ///
  /// In en, this message translates to:
  /// **'Max'**
  String get maxPrice;

  /// No description provided for @inStockOnly.
  ///
  /// In en, this message translates to:
  /// **'In stock only'**
  String get inStockOnly;

  /// No description provided for @applyFilters.
  ///
  /// In en, this message translates to:
  /// **'Apply filters'**
  String get applyFilters;

  /// No description provided for @assistantTitle.
  ///
  /// In en, this message translates to:
  /// **'Shopping assistant'**
  String get assistantTitle;

  /// No description provided for @assistantComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Your AI shopping assistant is coming soon.'**
  String get assistantComingSoon;

  /// No description provided for @assistantEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'How can I help?'**
  String get assistantEmptyTitle;

  /// No description provided for @assistantEmptyBody.
  ///
  /// In en, this message translates to:
  /// **'Ask me to find products, compare options, or get recommendations.'**
  String get assistantEmptyBody;

  /// No description provided for @assistantInputHint.
  ///
  /// In en, this message translates to:
  /// **'Ask about products…'**
  String get assistantInputHint;

  /// No description provided for @assistantUnavailable.
  ///
  /// In en, this message translates to:
  /// **'The assistant isn\'t available right now. Please try again later.'**
  String get assistantUnavailable;

  /// No description provided for @assistantError.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get assistantError;

  /// No description provided for @assistantNewChat.
  ///
  /// In en, this message translates to:
  /// **'New chat'**
  String get assistantNewChat;

  /// No description provided for @assistantGuestCta.
  ///
  /// In en, this message translates to:
  /// **'Try our skincare assistant'**
  String get assistantGuestCta;

  /// No description provided for @assistantGuestRemaining.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =1{1 free message left} other{{count} free messages left}}'**
  String assistantGuestRemaining(int count);

  /// No description provided for @assistantGuestWallTitle.
  ///
  /// In en, this message translates to:
  /// **'Log in to keep chatting'**
  String get assistantGuestWallTitle;

  /// No description provided for @assistantGuestWallBody.
  ///
  /// In en, this message translates to:
  /// **'You\'ve used your free messages. Log in or create an account to continue your consultation.'**
  String get assistantGuestWallBody;

  /// No description provided for @editProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit profile'**
  String get editProfile;

  /// No description provided for @changePassword.
  ///
  /// In en, this message translates to:
  /// **'Change password'**
  String get changePassword;

  /// No description provided for @preferences.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get preferences;

  /// No description provided for @theme.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get theme;

  /// No description provided for @saveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get saveChanges;

  /// No description provided for @changePhoto.
  ///
  /// In en, this message translates to:
  /// **'Change photo'**
  String get changePhoto;

  /// No description provided for @currentPassword.
  ///
  /// In en, this message translates to:
  /// **'Current password'**
  String get currentPassword;

  /// No description provided for @confirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm new password'**
  String get confirmPassword;

  /// No description provided for @passwordsDontMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords don\'t match.'**
  String get passwordsDontMatch;

  /// No description provided for @passwordChanged.
  ///
  /// In en, this message translates to:
  /// **'Password changed.'**
  String get passwordChanged;

  /// No description provided for @profileUpdated.
  ///
  /// In en, this message translates to:
  /// **'Profile updated.'**
  String get profileUpdated;

  /// No description provided for @avatarUpdated.
  ///
  /// In en, this message translates to:
  /// **'Photo updated.'**
  String get avatarUpdated;

  /// No description provided for @nameRequired.
  ///
  /// In en, this message translates to:
  /// **'Name is required.'**
  String get nameRequired;

  /// No description provided for @themeLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get themeDark;

  /// No description provided for @fillAllFields.
  ///
  /// In en, this message translates to:
  /// **'Please fill in all fields.'**
  String get fillAllFields;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters.'**
  String get passwordTooShort;

  /// No description provided for @productsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} products'**
  String productsCount(String count);

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @notifMarkAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get notifMarkAllRead;

  /// No description provided for @noNotificationsYet.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get noNotificationsYet;

  /// No description provided for @notificationsHint.
  ///
  /// In en, this message translates to:
  /// **'Updates about your orders will appear here.'**
  String get notificationsHint;

  /// No description provided for @notificationsLoadError.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load your notifications.'**
  String get notificationsLoadError;

  /// No description provided for @notifOrderPlacedTitle.
  ///
  /// In en, this message translates to:
  /// **'Order placed'**
  String get notifOrderPlacedTitle;

  /// No description provided for @notifOrderPlacedBody.
  ///
  /// In en, this message translates to:
  /// **'Your order {number} has been placed.'**
  String notifOrderPlacedBody(String number);

  /// No description provided for @notifOrderUpdateTitle.
  ///
  /// In en, this message translates to:
  /// **'Order update'**
  String get notifOrderUpdateTitle;

  /// No description provided for @notifOrderStatusBody.
  ///
  /// In en, this message translates to:
  /// **'Order {number} is now {status}.'**
  String notifOrderStatusBody(String number, String status);
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
