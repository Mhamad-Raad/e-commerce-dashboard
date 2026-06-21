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
  String productsCount(int count) {
    return '$count بەرهەم';
  }
}
