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
  String get gender => 'الجنس';

  @override
  String get genderFemale => 'أنثى';

  @override
  String get genderMale => 'ذكر';

  @override
  String get genderRequired => 'الرجاء اختيار الجنس.';

  @override
  String get routineReminderTitle => 'وقت العناية ببشرتك ✨';

  @override
  String get routineReminderBody =>
      'هل أكملت روتينك اليوم؟ اضغط لمتابعة سريعة.';

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
  String get linkOpenError => 'تعذّر فتح الرابط.';

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
  String get selectAll => 'الكل';

  @override
  String arrivalEstimate(String min, String max) {
    return 'يصل خلال $min–$max أيام';
  }

  @override
  String arrivalEstimateSingle(String days) {
    return 'يصل خلال $days أيام';
  }

  @override
  String get removeFromCart => 'إزالة من السلة؟';

  @override
  String get removeFromCartMessage => 'ستتم إزالة هذا المنتج من سلتك.';

  @override
  String selectedItemsCount(String count, String total) {
    return '$count من $total محدد';
  }

  @override
  String get reviewOrder => 'مراجعة الطلب';

  @override
  String get useThisAddress => 'استخدام هذا العنوان';

  @override
  String get updateRequiredTitle => 'التحديث مطلوب';

  @override
  String get updateRequiredBody =>
      'هذا الإصدار من التطبيق لم يعد مدعومًا. يرجى التحديث للمتابعة.';

  @override
  String get updateAvailableTitle => 'يتوفر تحديث';

  @override
  String get updateAvailableBody => 'يتوفر إصدار أحدث من التطبيق.';

  @override
  String get updateNow => 'حدّث الآن';

  @override
  String get notNow => 'ليس الآن';

  @override
  String resendCodeIn(String seconds) {
    return 'إعادة إرسال الرمز ($seconds ث)';
  }

  @override
  String get accountInformation => 'معلومات الحساب';

  @override
  String get contactInformation => 'معلومات التواصل';

  @override
  String get security => 'الأمان';

  @override
  String get emailInvalid => 'أدخل بريدًا إلكترونيًا صحيحًا.';

  @override
  String get deleteAccount => 'حذف الحساب';

  @override
  String get deleteAccountConfirmTitle => 'حذف حسابك؟';

  @override
  String get deleteAccountConfirmBody =>
      'سيتم تعطيل حسابك وتسجيل خروجك. تواصل مع الدعم إذا غيّرت رأيك.';

  @override
  String get supportSection => 'الدعم';

  @override
  String get aboutTitle => 'من نحن';

  @override
  String get aboutIntro => 'جمال أصلي يصل إلى كل ركن في العراق.';

  @override
  String get aboutStoryTitle => 'قصتنا';

  @override
  String get aboutBody1 =>
      'بدأ متجر روژنا بفكرة بسيطة: كل شخص في العراق يستحق منتجات تجميل وعناية أصلية دون القلق من التقليد أو الأسعار المبالغ بها.';

  @override
  String get aboutBody2 =>
      'اليوم نجمع علامات موثوقة في مكان واحد، بأسعار واضحة بالدينار العراقي، وتوصيل لجميع المحافظات، وفريق يهتم بطلبك كأنه طلبه.';

  @override
  String get aboutWhyTitle => 'لماذا نحن';

  @override
  String get aboutFeature1Title => 'أصلي ١٠٠٪';

  @override
  String get aboutFeature1Body =>
      'كل منتج من موردين موثوقين — أصلي دائمًا وبلا استثناء.';

  @override
  String get aboutFeature2Title => 'توصيل لكل العراق';

  @override
  String get aboutFeature2Body =>
      'نوصل إلى جميع المحافظات مع موعد وصول تقديري واضح قبل الطلب.';

  @override
  String get aboutFeature3Title => 'دعم حقيقي';

  @override
  String get aboutFeature3Body =>
      'أسئلة قبل الطلب أو بعده؟ فريقنا على بعد اتصال أو رسالة.';

  @override
  String get faqTitle => 'الأسئلة الشائعة';

  @override
  String get faqSubtitle => 'إجابات سريعة عن أكثر الأسئلة تكرارًا.';

  @override
  String get faqQ1 => 'كم يستغرق التوصيل؟';

  @override
  String get faqA1 =>
      'تصل أغلب الطلبات خلال ٣–٧ أيام حسب محافظتك. يعرض كل متجر موعد الوصول التقديري في سلتك قبل الطلب.';

  @override
  String get faqQ2 => 'ما طرق الدفع المتاحة؟';

  @override
  String get faqA2 =>
      'الدفع عند الاستلام، زين كاش، FIB، التحويل المصرفي وغيرها — اختر ما يناسبك عند إتمام الطلب.';

  @override
  String get faqQ3 => 'هل منتجاتكم أصلية؟';

  @override
  String get faqA3 => 'نعم. نستورد كل علامة من موردين موثوقين ونضمن الأصالة.';

  @override
  String get faqQ4 => 'هل يمكن الإرجاع أو الاستبدال؟';

  @override
  String get faqA4 =>
      'إذا وصل المنتج تالفًا أو خاطئًا، تواصل معنا خلال ٣ أيام من الاستلام وسنصحح الأمر.';

  @override
  String get faqQ5 => 'كيف أتابع طلبي؟';

  @override
  String get faqA5 =>
      'افتح «طلباتي» لمتابعة حالة الطلب، وسنرسل لك إشعارًا عند كل خطوة.';

  @override
  String get contactTitle => 'تواصل معنا';

  @override
  String get contactSubtitle =>
      'يسعدنا مساعدتك — تواصل معنا عبر أي من هذه الطرق.';

  @override
  String get contactCall => 'اتصل بنا';

  @override
  String get contactWhatsApp => 'واتساب';

  @override
  String get contactEmail => 'البريد الإلكتروني';

  @override
  String get contactAddress => 'العنوان';

  @override
  String get contactLoadError => 'تعذّر تحميل بيانات التواصل.';

  @override
  String get contactFollowUs => 'تابعنا';

  @override
  String get privacyTitle => 'سياسة الخصوصية';

  @override
  String get privacyBody =>
      'نجمع فقط ما نحتاجه لخدمتك: اسمك ورقم هاتفك وعناوين التوصيل وسجل الطلبات. يُستخدم رقم هاتفك لتأمين حسابك وتنسيق التوصيل.\n\nلا نبيع معلوماتك الشخصية لأي طرف ثالث. تُشارك تفاصيل الطلب فقط مع القائمين على توصيل شحنتك.\n\nتُخزَّن بياناتك بأمان، وتُسدَّد المبالغ عند الاستلام أو عبر وسيلة الدفع التي تختارها — لا نخزّن أرقام البطاقات.\n\nيمكنك تحديث معلوماتك في أي وقت من ملفك الشخصي، ويمكنك طلب حذف الحساب من شاشة تعديل الملف أو بالتواصل مع الدعم.';

  @override
  String get termsTitle => 'شروط الاستخدام';

  @override
  String get termsBody =>
      'باستخدامك هذا التطبيق فأنت توافق على هذه الشروط.\n\nالطلبات: تقديم الطلب هو عرض للشراء؛ المنتجات خاضعة للتوفر والتأكيد. الأسعار معروضة بالدينار العراقي وقد تتغير حتى تأكيد طلبك.\n\nالتوصيل: مواعيد الوصول تقديرية وليست مضمونة. يرجى إدخال عنوان وبيانات تواصل دقيقة — تكرار فشل التسليم قد يقيّد خيار الدفع عند الاستلام.\n\nالحساب: أنت مسؤول عن الحفاظ على بيانات دخولك. قد نوقف الحسابات التي تسيء استخدام الخدمة أو تحاول الاحتيال.\n\nالإرجاع: تواصل معنا خلال ٣ أيام من الاستلام للمنتجات التالفة أو الخاطئة.\n\nقد تُحدَّث هذه الشروط من وقت لآخر؛ استمرارك بالاستخدام يعني قبولك أحدث نسخة.';

  @override
  String get returnPolicyTitle => 'الاسترجاع والاستبدال';

  @override
  String get returnPolicyBody =>
      'نريدك أن تحب كل طلب — وإذا حدث خطأ ما، سنصحّحه.\n\nالمنتجات التالفة أو الخاطئة: إذا وصل طلبك تالفًا أو معيبًا أو مختلفًا عمّا طلبته، تواصل معنا خلال ٣ أيام من الاستلام وسنستبدله أو نعيد لك المبلغ شاملًا التوصيل.\n\nطريقة طلب الاسترجاع: راسلنا عبر صفحة تواصل معنا (اتصال أو واتساب أو بريد إلكتروني) مع رقم الطلب وصور واضحة للمنتج وتغليفه، وسيؤكد لك فريقنا الخطوات التالية.\n\nحالة المنتج: يجب أن تكون المنتجات غير مستخدمة وفي تغليفها الأصلي. لأسباب تتعلق بالنظافة والسلامة، لا يمكن استرجاع منتجات التجميل والعناية بالبشرة المفتوحة إلا إذا وصلت تالفة أو خاطئة.\n\nاسترداد المبلغ: بعد الموافقة على الاسترجاع، تُعاد مدفوعات الدفع عند الاستلام عبر تحويل مالي، وتُعاد وسائل الدفع الأخرى بنفس طريقة الدفع. يُصرف المبلغ خلال أيام قليلة من استلامنا للمنتج المرتجع.';

  @override
  String get shippingPolicyTitle => 'الشحن والتوصيل';

  @override
  String get shippingPolicyBody =>
      'نوصل إلى جميع محافظات العراق.\n\nمدة التوصيل: تصل معظم الطلبات خلال ٣–٧ أيام حسب محافظتك. يعرض كل متجر موعد الوصول التقديري في سلتك قبل إتمام الطلب.\n\nرسوم التوصيل: تظهر أي رسوم توصيل بوضوح عند إتمام الطلب وقبل التأكيد — بلا مفاجآت عند الباب.\n\nتتبع الطلب: تابع حالة طلبك في أي وقت من طلباتي، ونرسل لك إشعارًا عند كل خطوة، كما سيتصل بك المندوب قبل التوصيل.\n\nاستلام الطلب: تأكد من صحة عنوانك ورقم هاتفك وسهولة الوصول إليك. إذا لم نتمكن من الوصول إليك سنحاول مجددًا أو نتواصل معك لإعادة الجدولة. يمكنك تحديث عناوينك في أي وقت من ملفك الشخصي.';

  @override
  String signupAgreeNotice(String terms, String privacy) {
    return 'بإنشاء حسابك فأنت توافق على $terms و$privacy.';
  }

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
  String reviewsCount(String count) {
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
  String itemsCount(String count) {
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
  String resultsCount(String count) {
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
  String get assistantEmptyTitle => 'كيف يمكنني المساعدة؟';

  @override
  String get assistantEmptyBody =>
      'اطلب مني إيجاد منتجات أو مقارنة الخيارات أو الحصول على توصيات.';

  @override
  String get assistantInputHint => 'اسأل عن المنتجات…';

  @override
  String get assistantUnavailable =>
      'المساعد غير متاح حاليًا. يرجى المحاولة لاحقًا.';

  @override
  String get assistantError => 'حدث خطأ ما. يرجى المحاولة مرة أخرى.';

  @override
  String get assistantNewChat => 'محادثة جديدة';

  @override
  String get assistantGuestCta => 'جرّبي مساعد العناية بالبشرة';

  @override
  String assistantGuestRemaining(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count رسائل مجانية متبقية',
      one: 'رسالة مجانية واحدة متبقية',
    );
    return '$_temp0';
  }

  @override
  String get assistantGuestWallTitle => 'سجّلي الدخول لمواصلة المحادثة';

  @override
  String get assistantGuestWallBody =>
      'لقد استخدمتِ رسائلك المجانية. سجّلي الدخول أو أنشئي حسابًا لمواصلة استشارتك.';

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
  String productsCount(String count) {
    return '$count منتج';
  }

  @override
  String get notifications => 'الإشعارات';

  @override
  String get notifMarkAllRead => 'تحديد الكل كمقروء';

  @override
  String get noNotificationsYet => 'لا توجد إشعارات بعد';

  @override
  String get notificationsHint => 'ستظهر تحديثات طلباتك هنا.';

  @override
  String get notificationsLoadError => 'تعذّر تحميل الإشعارات.';

  @override
  String get notifOrderPlacedTitle => 'تم تقديم الطلب';

  @override
  String notifOrderPlacedBody(String number) {
    return 'تم تقديم طلبك $number.';
  }

  @override
  String get notifOrderUpdateTitle => 'تحديث الطلب';

  @override
  String notifOrderStatusBody(String number, String status) {
    return 'طلبك $number الآن $status.';
  }

  @override
  String get reviewsTitle => 'التقييمات';

  @override
  String get seeAllReviews => 'عرض كل التقييمات';

  @override
  String get writeReview => 'اكتب تقييمًا';

  @override
  String get editReview => 'عدّل تقييمك';

  @override
  String get yourReview => 'تقييمك';

  @override
  String get reviewPendingApproval => 'بانتظار الموافقة';

  @override
  String get reviewRatingLabel => 'تقييمك';

  @override
  String get reviewTitleLabel => 'العنوان (اختياري)';

  @override
  String get reviewCommentLabel => 'التعليق (اختياري)';

  @override
  String get reviewSubmit => 'إرسال التقييم';

  @override
  String get reviewDelete => 'حذف التقييم';

  @override
  String get reviewDeleteConfirm => 'حذف تقييمك؟';

  @override
  String get reviewDeleteConfirmBody => 'سيُحذف تقييمك من هذا المنتج.';

  @override
  String get reviewSubmitted => 'شكرًا لك! سيظهر تقييمك بعد الموافقة عليه.';

  @override
  String get reviewDeleted => 'تم حذف التقييم.';

  @override
  String get reviewNotEligible => 'يمكنك تقييم المنتجات التي استلمتها.';

  @override
  String get reviewRatingRequired => 'الرجاء اختيار تقييم.';

  @override
  String get reviewsLoadError => 'تعذّر تحميل التقييمات.';

  @override
  String get noReviewsYet => 'لا توجد تقييمات بعد';

  @override
  String get reviewsEmptyHint => 'كن أول من يقيّم هذا المنتج.';

  @override
  String get orderProgress => 'مسار الطلب';

  @override
  String get cancelOrder => 'إلغاء الطلب';

  @override
  String get keepOrder => 'الاحتفاظ بالطلب';

  @override
  String get cancelOrderConfirmTitle => 'إلغاء هذا الطلب؟';

  @override
  String get cancelOrderConfirmBody => 'سيُلغى طلبك ولا يمكن التراجع عن ذلك.';

  @override
  String get orderCancelled => 'تم إلغاء طلبك.';

  @override
  String get orderCancelTooLate => 'لم يعد بالإمكان إلغاء هذا الطلب.';

  @override
  String get reorder => 'اطلب مجددًا';

  @override
  String reorderAdded(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'أُضيفت $count منتجات إلى سلتك',
      one: 'أُضيف منتج واحد إلى سلتك',
    );
    return '$_temp0';
  }

  @override
  String get reorderSkippedTitle => 'تعذّرت إضافة بعض المنتجات';

  @override
  String get reorderUnavailable => 'لم يعد متوفرًا';

  @override
  String get goToCart => 'الذهاب إلى السلة';

  @override
  String get orderCancelledBanner => 'أُلغي هذا الطلب';

  @override
  String get orderRefundedBanner => 'أُعيد مبلغ هذا الطلب';

  @override
  String get storiesTitle => 'القصص';

  @override
  String get blogLoadError => 'تعذّر تحميل القصص.';

  @override
  String get blogEmpty => 'لا توجد قصص بعد';

  @override
  String get blogEmptyHint => 'عُد قريبًا للاطلاع على النصائح والأخبار.';
}
