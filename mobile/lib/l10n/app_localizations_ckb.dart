// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Central Kurdish (`ckb`).
class AppLocalizationsCkb extends AppLocalizations {
  AppLocalizationsCkb([String locale = 'ckb']) : super(locale);

  @override
  String get brandName => 'فرۆشگای ڕۆژنا';

  @override
  String get loginSubtitle => 'بۆ بەردەوامبوون بچۆ ژوورەوە';

  @override
  String get phoneNumber => 'ژمارەی مۆبایل';

  @override
  String get password => 'وشەی نهێنی';

  @override
  String get forgotPassword => 'وشەی نهێنیت لەبیرکردووە؟';

  @override
  String get logIn => 'چوونەژوورەوە';

  @override
  String get newHere => 'نوێیت لێرە؟';

  @override
  String get createAccount => 'هەژمار دروستبکە';

  @override
  String get enterPhoneAndPassword => 'ژمارەی مۆبایل و وشەی نهێنی بنووسە.';

  @override
  String get verifyToContinue =>
      'بۆ بەردەوامبوون ژمارەکەت پشتڕاستبکەرەوە — کۆدێکمان نارد.';

  @override
  String get createYourAccount => 'هەژمارەکەت دروستبکە';

  @override
  String get fullName => 'ناوی تەواو';

  @override
  String get emailOptional => 'ئیمەیل (ئیختیاری)';

  @override
  String get passwordMin8 => 'وشەی نهێنی (لانیکەم ٨ پیت)';

  @override
  String get namePhonePasswordRequired =>
      'ناو، ژمارەی مۆبایل و وشەی نهێنی پێویستن.';

  @override
  String get numberAlreadyRegistered =>
      'ئەم ژمارەیە هەژماری هەیە. تکایە بچۆ ژوورەوە.';

  @override
  String get verifyYourNumber => 'ژمارەکەت پشتڕاستبکەرەوە';

  @override
  String otpSentTo(String phone) {
    return 'ئەو کۆدە بنووسە کە لە ڕێگەی واتساپەوە بۆ $phone ناردمان.';
  }

  @override
  String get verificationCode => 'کۆدی پشتڕاستکردنەوە';

  @override
  String get verify => 'پشتڕاستکردنەوە';

  @override
  String get resendCode => 'نەگەیشت؟ کۆدەکە دووبارە بنێرە';

  @override
  String get newCodeSent => 'کۆدێکی نوێ لە ڕێگەدایە.';

  @override
  String get enterTheCode => 'ئەو کۆدە بنووسە کە بۆمان ناردیت.';

  @override
  String get resetPassword => 'ڕێکخستنەوەی وشەی نهێنی';

  @override
  String get forgotSubtitle =>
      'ژمارەی مۆبایلەکەت بنووسە و کۆدی ڕێکخستنەوەت لە واتساپ بۆ دەنێرین.';

  @override
  String get sendCode => 'ناردنی کۆد';

  @override
  String get enterPhone => 'ژمارەی مۆبایلەکەت بنووسە.';

  @override
  String get ifRegisteredCodeSent => 'ئەگەر ژمارەکە تۆمارکرابێت، کۆدێک نێردرا.';

  @override
  String get newPasswordTitle => 'وشەی نهێنی نوێ';

  @override
  String get newPasswordSubtitle =>
      'کۆدەکە بنووسە و وشەیەکی نهێنی نوێ هەڵبژێرە.';

  @override
  String get resetCode => 'کۆدی ڕێکخستنەوە';

  @override
  String get newPasswordMin8 => 'وشەی نهێنی نوێ (لانیکەم ٨ پیت)';

  @override
  String get savePassword => 'پاشەکەوتکردنی وشەی نهێنی';

  @override
  String get fillCodeAndPassword => 'کۆد و وشەی نهێنی نوێ پڕبکەرەوە.';

  @override
  String get passwordUpdated => 'وشەی نهێنی نوێکرایەوە. تکایە بچۆ ژوورەوە.';

  @override
  String get logOut => 'چوونەدەرەوە';

  @override
  String get tabHome => 'سەرەکی';

  @override
  String get tabShop => 'فرۆشگا';

  @override
  String get tabSearch => 'گەڕان';

  @override
  String get tabProfile => 'هەژمار';

  @override
  String get categoriesTitle => 'پۆلەکان';

  @override
  String get featuredTitle => 'هەڵبژێردراو';

  @override
  String get shopsTitle => 'فرۆشگاکان';

  @override
  String get seeAll => 'هەمووی ببینە';

  @override
  String get homeLoadError => 'نەتوانرا پەڕەی سەرەکی باربکرێت.';

  @override
  String get retry => 'دووبارە هەوڵبدەرەوە';

  @override
  String get comingSoon => 'بەمزووانە';

  @override
  String get toggleTheme => 'گۆڕینی ڕووکار';

  @override
  String get language => 'زمان';

  @override
  String get account => 'هەژمار';

  @override
  String get myAddresses => 'ناونیشانەکانم';

  @override
  String get addAddress => 'زیادکردنی ناونیشان';

  @override
  String get editAddress => 'دەستکاریکردنی ناونیشان';

  @override
  String get noAddressesYet => 'هێشتا هیچ ناونیشانێک نییە';

  @override
  String get addAddressHint =>
      'ناونیشانێکی گەیاندن زیاد بکە تا بزانین داواکارییەکانت بۆ کوێ بنێرین.';

  @override
  String get addressLabel => 'ناونیشان (وەک: ماڵەوە، کار)';

  @override
  String get addressFallbackLabel => 'ناونیشان';

  @override
  String get governorate => 'پارێزگا';

  @override
  String get city => 'شار';

  @override
  String get district => 'گەڕەک';

  @override
  String get street => 'شەقام';

  @override
  String get nearestLandmark => 'نزیکترین نیشانە';

  @override
  String get contactPhone => 'ژمارەی پەیوەندی';

  @override
  String get setAsDefault => 'وەک بنەڕەت دایبنێ';

  @override
  String get defaultBadge => 'بنەڕەت';

  @override
  String get saveAddress => 'پاشەکەوتکردنی ناونیشان';

  @override
  String get selectGovernorate => 'پارێزگا هەڵبژێرە';

  @override
  String get selectCity => 'شار هەڵبژێرە';

  @override
  String get governorateCityRequired => 'تکایە پارێزگا و شار هەڵبژێرە.';

  @override
  String get deleteAddress => 'سڕینەوەی ناونیشان';

  @override
  String get deleteAddressConfirm => 'ئەم ناونیشانە بسڕێتەوە؟';

  @override
  String get delete => 'سڕینەوە';

  @override
  String get cancel => 'هەڵوەشاندنەوە';

  @override
  String get addressDeleted => 'ناونیشان سڕایەوە.';

  @override
  String get addressesLoadError => 'نەتوانرا ناونیشانەکانت باربکرێن.';

  @override
  String get makeDefault => 'بیکە بە بنەڕەت';

  @override
  String get cartTitle => 'سەبەتە';

  @override
  String get cartEmpty => 'سەبەتەکەت بەتاڵە';

  @override
  String get startShopping => 'دەستبکە بە کڕین';

  @override
  String get cartLoadError => 'نەتوانرا سەبەتەکەت باربکرێت.';

  @override
  String get couponCode => 'کۆدی داشکاندن';

  @override
  String get apply => 'جێبەجێکردن';

  @override
  String get remove => 'لابردن';

  @override
  String get subtotal => 'کۆی بەشەکی';

  @override
  String get discount => 'داشکاندن';

  @override
  String get taxesFeesAtCheckout => 'باج و کرێکان لە کاتی پارەدان دەژمێردرێن.';

  @override
  String get proceedToCheckout => 'بەردەوامبوون بۆ پارەدان';

  @override
  String get selectAddress => 'ناونیشان هەڵبژێرە';

  @override
  String get noAddressForCheckout =>
      'بۆ بەردەوامبوون پێویستت بە ناونیشانی گەیاندنە.';

  @override
  String get addAnotherAddress => 'ناونیشانێکی تر زیاد بکە';

  @override
  String get continueToReview => 'بەردەوامبوون';

  @override
  String get checkout => 'پارەدان';

  @override
  String get deliveryAddress => 'ناونیشانی گەیاندن';

  @override
  String get change => 'گۆڕین';

  @override
  String get orderItems => 'ئایتمەکان';

  @override
  String get notesOptional => 'تێبینی (ئیختیاری)';

  @override
  String get notesHint => 'هیچ ڕێنماییەک بۆ گەیاندن؟';

  @override
  String get paymentMethod => 'شێوازی پارەدان';

  @override
  String get orderSummary => 'کورتەی داواکاری';

  @override
  String get tax => 'باج';

  @override
  String get fees => 'کرێ';

  @override
  String get shipping => 'گەیاندن';

  @override
  String get total => 'کۆی گشتی';

  @override
  String get placeOrder => 'داواکاری بکە';

  @override
  String get orderPlaced => 'داواکارییەکەت تۆمارکرا!';

  @override
  String get orderPlacedSubtitle =>
      'سوپاس. داواکارییەکەتمان وەرگرت و پەیوەندیت پێوە دەکەین بۆ پشتڕاستکردنەوە.';

  @override
  String get orderNumber => 'ژمارەی داواکاری';

  @override
  String get continueShopping => 'بەردەوامبە لە کڕین';

  @override
  String get payCod => 'پارەدان لە کاتی گەیاندن';

  @override
  String get payZainCash => 'زین کاش';

  @override
  String get payFib => 'FIB';

  @override
  String get payTransfer => 'گواستنەوەی بانکی';

  @override
  String get payCard => 'کارت';

  @override
  String get payWallet => 'جزدان';

  @override
  String get addedToCart => 'زیادکرا بۆ سەبەتە';

  @override
  String get addToCart => 'زیادکردن بۆ سەبەتە';

  @override
  String get outOfStock => 'نەماوە';

  @override
  String get options => 'هەڵبژاردەکان';

  @override
  String get productDescription => 'وەسف';

  @override
  String reviewsCount(int count) {
    return '$count هەڵسەنگاندن';
  }

  @override
  String get productLoadError => 'نەتوانرا ئەم بەرهەمە باربکرێت.';

  @override
  String get addedToFavorites => 'زیادکرا بۆ دڵخوازەکان';

  @override
  String get removedFromFavorites => 'لابرا لە دڵخوازەکان';

  @override
  String get myFavorites => 'دڵخوازەکانم';

  @override
  String get noFavoritesYet => 'هێشتا هیچ دڵخوازێک نییە';

  @override
  String get favoritesHint =>
      'دەست بنێ بە دڵی هەر بەرهەمێک بۆ پاشەکەوتکردنی لێرە.';

  @override
  String get favoritesLoadError => 'نەتوانرا دڵخوازەکانت باربکرێن.';

  @override
  String get myOrders => 'داواکارییەکانم';

  @override
  String get orderDetailTitle => 'وردەکارییەکانی داواکاری';

  @override
  String get noOrdersYet => 'هێشتا هیچ داواکارییەک نییە';

  @override
  String get ordersHint => 'داواکارییەکانت لێرە دەردەکەون.';

  @override
  String get ordersLoadError => 'نەتوانرا داواکارییەکانت باربکرێن.';

  @override
  String get orderLoadError => 'نەتوانرا ئەم داواکارییە باربکرێت.';

  @override
  String itemsCount(int count) {
    return '$count ئایتم';
  }

  @override
  String get trackingNumber => 'ژمارەی شوێنکەوتن';

  @override
  String get notes => 'تێبینییەکان';

  @override
  String get viewMyOrders => 'بینینی داواکارییەکانم';

  @override
  String get orderStatusPending => 'چاوەڕوان';

  @override
  String get orderStatusPaid => 'پارەدراو';

  @override
  String get orderStatusProcessing => 'ئامادەکردن';

  @override
  String get orderStatusShipped => 'نێردرا';

  @override
  String get orderStatusOutForDelivery => 'لە ڕێگەی گەیاندندایە';

  @override
  String get orderStatusDelivered => 'گەیەنرا';

  @override
  String get orderStatusCancelled => 'هەڵوەشێنرایەوە';

  @override
  String get orderStatusRefunded => 'گەڕێنرایەوە';

  @override
  String get payStatusPending => 'چاوەڕوان';

  @override
  String get payStatusPaid => 'پارەدراو';

  @override
  String get payStatusFailed => 'سەرکەوتوو نەبوو';

  @override
  String get payStatusRefunded => 'گەڕێنرایەوە';

  @override
  String get tabProducts => 'بەرهەمەکان';

  @override
  String get tabAssistant => 'یاریدەدەر';

  @override
  String get searchProducts => 'گەڕان بۆ بەرهەم';

  @override
  String get stores => 'فرۆشگاکان';

  @override
  String get storesLoadError => 'نەتوانرا فرۆشگاکان باربکرێن.';

  @override
  String get noResults => 'هیچ ئەنجامێک نییە';

  @override
  String resultsCount(int count) {
    return '$count ئەنجام';
  }

  @override
  String get filters => 'فلتەرەکان';

  @override
  String get reset => 'ڕێکخستنەوە';

  @override
  String get sortBy => 'ڕیزکردن بەپێی';

  @override
  String get sortNewest => 'نوێترین';

  @override
  String get sortPriceAsc => 'نرخ: لە کەمەوە بۆ زۆر';

  @override
  String get sortPriceDesc => 'نرخ: لە زۆرەوە بۆ کەم';

  @override
  String get sortRating => 'بەرزترین هەڵسەنگاندن';

  @override
  String get priceRange => 'مەودای نرخ';

  @override
  String get minPrice => 'کەمترین';

  @override
  String get maxPrice => 'زۆرترین';

  @override
  String get inStockOnly => 'تەنها ئەوەی بەردەستە';

  @override
  String get applyFilters => 'جێبەجێکردنی فلتەر';

  @override
  String get assistantTitle => 'یاریدەدەری کڕین';

  @override
  String get assistantComingSoon => 'یاریدەدەری زیرەکی کڕینت بەمزووانە دێت.';

  @override
  String get editProfile => 'دەستکاری پرۆفایل';

  @override
  String get changePassword => 'گۆڕینی وشەی نهێنی';

  @override
  String get preferences => 'هەڵبژاردنەکان';

  @override
  String get theme => 'ڕووکار';

  @override
  String get saveChanges => 'پاشەکەوتکردنی گۆڕانکارییەکان';

  @override
  String get changePhoto => 'گۆڕینی وێنە';

  @override
  String get currentPassword => 'وشەی نهێنی ئێستا';

  @override
  String get confirmPassword => 'دڵنیاکردنەوەی وشەی نهێنی نوێ';

  @override
  String get passwordsDontMatch => 'وشە نهێنییەکان وەک یەک نین.';

  @override
  String get passwordChanged => 'وشەی نهێنی گۆڕدرا.';

  @override
  String get profileUpdated => 'پرۆفایل نوێکرایەوە.';

  @override
  String get avatarUpdated => 'وێنە نوێکرایەوە.';

  @override
  String get nameRequired => 'ناو پێویستە.';

  @override
  String get themeLight => 'ڕووناک';

  @override
  String get themeDark => 'تاریک';

  @override
  String get fillAllFields => 'تکایە هەموو خانەکان پڕبکەرەوە.';

  @override
  String get passwordTooShort => 'وشەی نهێنی دەبێت لانیکەم ٨ پیت بێت.';

  @override
  String productsCount(int count) {
    return '$count بەرهەم';
  }

  @override
  String get notifications => 'ئاگادارکردنەوەکان';

  @override
  String get notifMarkAllRead => 'هەموو وەک خوێندراوە دیاریبکە';

  @override
  String get noNotificationsYet => 'هێشتا هیچ ئاگادارکردنەوەیەک نییە';

  @override
  String get notificationsHint => 'نوێکردنەوەی داواکاریەکانت لێرە دەردەکەون.';

  @override
  String get notificationsLoadError => 'نەتوانرا ئاگادارکردنەوەکان باربکرێن.';

  @override
  String get notifOrderPlacedTitle => 'داواکاری تۆمارکرا';

  @override
  String notifOrderPlacedBody(String number) {
    return 'داواکاریەکەت $number تۆمارکرا.';
  }

  @override
  String get notifOrderUpdateTitle => 'نوێکردنەوەی داواکاری';

  @override
  String notifOrderStatusBody(String number, String status) {
    return 'داواکاری $number ئێستا $statusـە.';
  }
}
