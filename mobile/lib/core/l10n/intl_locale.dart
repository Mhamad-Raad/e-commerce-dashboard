/// intl has no Kurdish Sorani (`ckb`) date/number data, so fall back to Arabic
/// (same script + digits). Mirrors the mapping in [Money].
String intlLocale(String languageCode) => languageCode == 'ckb' ? 'ar' : languageCode;
