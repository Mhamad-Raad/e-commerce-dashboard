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

  @override
  String get tabHome => 'الرئيسية';

  @override
  String get tabShop => 'المتجر';

  @override
  String get tabSearch => 'بحث';

  @override
  String get tabProfile => 'حسابي';

  @override
  String get categoriesTitle => 'الفئات';

  @override
  String get featuredTitle => 'المميّزة';

  @override
  String get shopsTitle => 'المتاجر';

  @override
  String get seeAll => 'عرض الكل';

  @override
  String get homeLoadError => 'تعذّر تحميل الصفحة الرئيسية.';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String get comingSoon => 'قريبًا';

  @override
  String get toggleTheme => 'تبديل السمة';

  @override
  String get language => 'اللغة';

  @override
  String get account => 'الحساب';

  @override
  String get myAddresses => 'عناويني';

  @override
  String get addAddress => 'إضافة عنوان';

  @override
  String get editAddress => 'تعديل العنوان';

  @override
  String get noAddressesYet => 'لا توجد عناوين بعد';

  @override
  String get addAddressHint => 'أضف عنوان توصيل حتى نعرف أين نشحن طلباتك.';

  @override
  String get addressLabel => 'التسمية (مثل: المنزل، العمل)';

  @override
  String get addressFallbackLabel => 'العنوان';

  @override
  String get governorate => 'المحافظة';

  @override
  String get city => 'المدينة';

  @override
  String get district => 'الحي';

  @override
  String get street => 'الشارع';

  @override
  String get nearestLandmark => 'أقرب نقطة دالة';

  @override
  String get contactPhone => 'هاتف للتواصل';

  @override
  String get setAsDefault => 'تعيين كافتراضي';

  @override
  String get defaultBadge => 'افتراضي';

  @override
  String get saveAddress => 'حفظ العنوان';

  @override
  String get selectGovernorate => 'اختر المحافظة';

  @override
  String get selectCity => 'اختر المدينة';

  @override
  String get governorateCityRequired => 'الرجاء اختيار المحافظة والمدينة.';

  @override
  String get deleteAddress => 'حذف العنوان';

  @override
  String get deleteAddressConfirm => 'حذف هذا العنوان؟';

  @override
  String get delete => 'حذف';

  @override
  String get cancel => 'إلغاء';

  @override
  String get addressDeleted => 'تم حذف العنوان.';

  @override
  String get addressesLoadError => 'تعذّر تحميل عناوينك.';

  @override
  String get makeDefault => 'جعله افتراضيًا';

  @override
  String get cartTitle => 'السلة';

  @override
  String get cartEmpty => 'سلتك فارغة';

  @override
  String get startShopping => 'ابدأ التسوّق';

  @override
  String get cartLoadError => 'تعذّر تحميل سلتك.';

  @override
  String get couponCode => 'رمز الخصم';

  @override
  String get apply => 'تطبيق';

  @override
  String get remove => 'إزالة';

  @override
  String get subtotal => 'المجموع الفرعي';

  @override
  String get discount => 'الخصم';

  @override
  String get taxesFeesAtCheckout => 'تُحتسب الضرائب والرسوم عند الدفع.';

  @override
  String get proceedToCheckout => 'المتابعة للدفع';

  @override
  String get selectAddress => 'اختر العنوان';

  @override
  String get noAddressForCheckout => 'تحتاج إلى عنوان توصيل للمتابعة.';

  @override
  String get addAnotherAddress => 'إضافة عنوان آخر';

  @override
  String get continueToReview => 'متابعة';

  @override
  String get checkout => 'الدفع';

  @override
  String get deliveryAddress => 'عنوان التوصيل';

  @override
  String get change => 'تغيير';

  @override
  String get orderItems => 'العناصر';

  @override
  String get notesOptional => 'ملاحظات (اختياري)';

  @override
  String get notesHint => 'أي تعليمات للتوصيل؟';

  @override
  String get paymentMethod => 'طريقة الدفع';

  @override
  String get orderSummary => 'ملخّص الطلب';

  @override
  String get tax => 'الضريبة';

  @override
  String get fees => 'الرسوم';

  @override
  String get shipping => 'الشحن';

  @override
  String get total => 'الإجمالي';

  @override
  String get placeOrder => 'تأكيد الطلب';

  @override
  String get orderPlaced => 'تم تأكيد الطلب!';

  @override
  String get orderPlacedSubtitle =>
      'شكرًا لك. استلمنا طلبك وسنتواصل معك للتأكيد.';

  @override
  String get orderNumber => 'رقم الطلب';

  @override
  String get continueShopping => 'متابعة التسوّق';

  @override
  String get payCod => 'الدفع عند الاستلام';

  @override
  String get payZainCash => 'زين كاش';

  @override
  String get payFib => 'FIB';

  @override
  String get payTransfer => 'تحويل بنكي';

  @override
  String get payCard => 'بطاقة';

  @override
  String get payWallet => 'محفظة';

  @override
  String get addedToCart => 'أُضيف إلى السلة';

  @override
  String get addToCart => 'أضف إلى السلة';

  @override
  String get outOfStock => 'غير متوفر';

  @override
  String get options => 'الخيارات';

  @override
  String get productDescription => 'الوصف';

  @override
  String reviewsCount(int count) {
    return '$count تقييم';
  }

  @override
  String get productLoadError => 'تعذّر تحميل هذا المنتج.';

  @override
  String get addedToFavorites => 'أُضيف إلى المفضلة';

  @override
  String get removedFromFavorites => 'أُزيل من المفضلة';

  @override
  String get myFavorites => 'مفضلتي';

  @override
  String get noFavoritesYet => 'لا توجد مفضلة بعد';

  @override
  String get favoritesHint => 'اضغط على القلب في أي منتج لحفظه هنا.';

  @override
  String get favoritesLoadError => 'تعذّر تحميل مفضلتك.';

  @override
  String get myOrders => 'طلباتي';

  @override
  String get orderDetailTitle => 'تفاصيل الطلب';

  @override
  String get noOrdersYet => 'لا توجد طلبات بعد';

  @override
  String get ordersHint => 'ستظهر طلباتك هنا.';

  @override
  String get ordersLoadError => 'تعذّر تحميل طلباتك.';

  @override
  String get orderLoadError => 'تعذّر تحميل هذا الطلب.';

  @override
  String itemsCount(int count) {
    return '$count عنصر';
  }

  @override
  String get trackingNumber => 'رقم التتبّع';

  @override
  String get notes => 'ملاحظات';

  @override
  String get viewMyOrders => 'عرض طلباتي';

  @override
  String get orderStatusPending => 'قيد الانتظار';

  @override
  String get orderStatusPaid => 'مدفوع';

  @override
  String get orderStatusProcessing => 'قيد التجهيز';

  @override
  String get orderStatusShipped => 'تم الشحن';

  @override
  String get orderStatusOutForDelivery => 'قيد التوصيل';

  @override
  String get orderStatusDelivered => 'تم التوصيل';

  @override
  String get orderStatusCancelled => 'ملغى';

  @override
  String get orderStatusRefunded => 'مُسترَد';

  @override
  String get payStatusPending => 'قيد الانتظار';

  @override
  String get payStatusPaid => 'مدفوع';

  @override
  String get payStatusFailed => 'فشل';

  @override
  String get payStatusRefunded => 'مُسترَد';

  @override
  String get tabProducts => 'المنتجات';

  @override
  String get tabAssistant => 'المساعد';

  @override
  String get searchProducts => 'ابحث عن منتجات';

  @override
  String get stores => 'المتاجر';

  @override
  String get storesLoadError => 'تعذّر تحميل المتاجر.';

  @override
  String get noResults => 'لا توجد نتائج';

  @override
  String resultsCount(int count) {
    return '$count نتيجة';
  }

  @override
  String get filters => 'الفلاتر';

  @override
  String get reset => 'إعادة تعيين';

  @override
  String get sortBy => 'ترتيب حسب';

  @override
  String get sortNewest => 'الأحدث';

  @override
  String get sortPriceAsc => 'السعر: من الأقل للأعلى';

  @override
  String get sortPriceDesc => 'السعر: من الأعلى للأقل';

  @override
  String get sortRating => 'الأعلى تقييمًا';

  @override
  String get priceRange => 'نطاق السعر';

  @override
  String get minPrice => 'الأدنى';

  @override
  String get maxPrice => 'الأعلى';

  @override
  String get inStockOnly => 'المتوفر فقط';

  @override
  String get applyFilters => 'تطبيق الفلاتر';

  @override
  String get assistantTitle => 'مساعد التسوّق';

  @override
  String get assistantComingSoon => 'مساعد التسوّق الذكي قادم قريبًا.';

  @override
  String get editProfile => 'تعديل الملف الشخصي';

  @override
  String get changePassword => 'تغيير كلمة المرور';

  @override
  String get preferences => 'التفضيلات';

  @override
  String get theme => 'السمة';

  @override
  String get saveChanges => 'حفظ التغييرات';

  @override
  String get changePhoto => 'تغيير الصورة';

  @override
  String get currentPassword => 'كلمة المرور الحالية';

  @override
  String get confirmPassword => 'تأكيد كلمة المرور الجديدة';

  @override
  String get passwordsDontMatch => 'كلمتا المرور غير متطابقتين.';

  @override
  String get passwordChanged => 'تم تغيير كلمة المرور.';

  @override
  String get profileUpdated => 'تم تحديث الملف الشخصي.';

  @override
  String get avatarUpdated => 'تم تحديث الصورة.';

  @override
  String get nameRequired => 'الاسم مطلوب.';

  @override
  String get themeLight => 'فاتح';

  @override
  String get themeDark => 'داكن';

  @override
  String get fillAllFields => 'الرجاء تعبئة جميع الحقول.';

  @override
  String get passwordTooShort => 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.';

  @override
  String productsCount(int count) {
    return '$count منتج';
  }
}
