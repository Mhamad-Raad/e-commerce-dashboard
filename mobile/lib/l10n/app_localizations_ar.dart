// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get brandName => 'متجر روژنا';

  @override
  String get loginSubtitle => 'سجّل الدخول للمتابعة';

  @override
  String get phoneNumber => 'رقم الهاتف';

  @override
  String get password => 'كلمة المرور';

  @override
  String get forgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get logIn => 'تسجيل الدخول';

  @override
  String get newHere => 'مستخدم جديد؟';

  @override
  String get createAccount => 'إنشاء حساب';

  @override
  String get enterPhoneAndPassword => 'أدخل رقم هاتفك وكلمة المرور.';

  @override
  String get verifyToContinue => 'فعّل رقمك للمتابعة — أرسلنا لك رمزًا.';

  @override
  String get createYourAccount => 'أنشئ حسابك';

  @override
  String get fullName => 'الاسم الكامل';

  @override
  String get emailOptional => 'البريد الإلكتروني (اختياري)';

  @override
  String get passwordMin8 => 'كلمة المرور (٨ أحرف على الأقل)';

  @override
  String get namePhonePasswordRequired =>
      'الاسم ورقم الهاتف وكلمة المرور مطلوبة.';

  @override
  String get numberAlreadyRegistered =>
      'هذا الرقم لديه حساب بالفعل. الرجاء تسجيل الدخول.';

  @override
  String get verifyYourNumber => 'فعّل رقمك';

  @override
  String otpSentTo(String phone) {
    return 'أدخل الرمز الذي أرسلناه عبر واتساب إلى $phone.';
  }

  @override
  String get verificationCode => 'رمز التحقق';

  @override
  String get verify => 'تحقّق';

  @override
  String get resendCode => 'لم يصلك الرمز؟ إعادة الإرسال';

  @override
  String get newCodeSent => 'في الطريق إليك رمز جديد.';

  @override
  String get enterTheCode => 'أدخل الرمز الذي أرسلناه إليك.';

  @override
  String get resetPassword => 'إعادة تعيين كلمة المرور';

  @override
  String get forgotSubtitle =>
      'أدخل رقم هاتفك وسنرسل رمز إعادة التعيين عبر واتساب.';

  @override
  String get sendCode => 'إرسال الرمز';

  @override
  String get enterPhone => 'أدخل رقم هاتفك.';

  @override
  String get ifRegisteredCodeSent => 'إذا كان الرقم مسجّلًا، فقد أُرسل رمز.';

  @override
  String get newPasswordTitle => 'كلمة مرور جديدة';

  @override
  String get newPasswordSubtitle =>
      'أدخل الرمز الذي أرسلناه واختر كلمة مرور جديدة.';

  @override
  String get resetCode => 'رمز إعادة التعيين';

  @override
  String get newPasswordMin8 => 'كلمة مرور جديدة (٨ أحرف على الأقل)';

  @override
  String get savePassword => 'حفظ كلمة المرور';

  @override
  String get fillCodeAndPassword => 'أدخل الرمز وكلمة المرور الجديدة.';

  @override
  String get passwordUpdated => 'تم تحديث كلمة المرور. الرجاء تسجيل الدخول.';

  @override
  String get logOut => 'تسجيل الخروج';
}
