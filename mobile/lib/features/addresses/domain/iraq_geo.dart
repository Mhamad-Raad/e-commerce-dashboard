/// Iraq governorate → city mapping, mirrored from the backend
/// (`backend/src/common/iraq-geo.ts`). Drives the dependent city dropdown on the
/// address form and keeps the client from submitting an invalid pair (the
/// backend re-validates regardless). Values are the Prisma enum names sent to
/// the API verbatim; [humanizeGeo] turns them into display labels.
class IraqGeo {
  IraqGeo._();

  static const Map<String, List<String>> governorateCities = {
    'BAGHDAD': ['BAGHDAD', 'ABU_GHRAIB', 'MAHMUDIYAH', 'TARMIYAH', 'SADR_CITY'],
    'BASRA': ['BASRA', 'ZUBAIR', 'ABU_AL_KHASIB', 'QURNA', 'FAW'],
    'NINEVEH': ['MOSUL', 'TAL_AFAR', 'SINJAR', 'HAMDANIYA', 'SHEIKHAN'],
    'ERBIL': ['ERBIL', 'SHAQLAWA', 'KOYA', 'SORAN', 'CHOMAN'],
    'SULAYMANIYAH': ['SULAYMANIYAH', 'RANIA', 'CHAMCHAMAL', 'KALAR', 'DUKAN'],
    'DUHOK': ['DUHOK', 'ZAKHO', 'AMEDI', 'SEMEL', 'AKRE'],
    'KIRKUK': ['KIRKUK', 'HAWIJA', 'DAQUQ', 'DIBIS'],
    'NAJAF': ['NAJAF', 'KUFA', 'MISHKHAB', 'MANATHERA'],
    'KARBALA': ['KARBALA', 'AIN_AL_TAMR', 'HINDIYA'],
    'BABYLON': ['HILLAH', 'MUSAYYIB', 'MAHAWIL', 'HASHIMIYA'],
    'WASIT': ['KUT', 'SUWAIRA', 'NUMANIYA', 'AZIZIYA', 'BADRA'],
    'MAYSAN': ['AMARAH', 'MAJAR_AL_KABIR', 'ALI_AL_GHARBI', 'QALAT_SALIH'],
    'DHI_QAR': ['NASIRIYAH', 'SHATRA', 'RIFAI', 'SUQ_AL_SHUYUKH', 'CHIBAYISH'],
    'MUTHANNA': ['SAMAWAH', 'RUMAITHA', 'KHIDHIR', 'SALMAN'],
    'QADISIYYAH': ['DIWANIYAH', 'AFAK', 'SHAMIYA', 'HAMZA'],
    'DIYALA': ['BAQUBAH', 'MUQDADIYAH', 'KHALIS', 'KHANAQIN', 'BALADRUZ'],
    'ANBAR': ['RAMADI', 'FALLUJAH', 'HIT', 'HADITHA', 'QAIM', 'RUTBA'],
    'SALADIN': ['TIKRIT', 'SAMARRA', 'BALAD', 'DUJAIL', 'SHIRQAT', 'BAIJI'],
    'HALABJA': ['HALABJA', 'KHURMAL', 'SAYID_SADIQ', 'BIYARA'],
  };

  static List<String> get governorates => governorateCities.keys.toList();

  static List<String> citiesOf(String? governorate) =>
      governorateCities[governorate] ?? const [];

  static bool isValidPair(String? governorate, String? city) =>
      citiesOf(governorate).contains(city);
}

/// Turns an enum name (`ABU_AL_KHASIB`) into a readable label (`Abu Al Khasib`).
/// Place names read the same across the app's languages, so a single
/// transliterated label is used for all locales.
String humanizeGeo(String value) => value
    .split('_')
    .map((w) => w.isEmpty ? w : '${w[0]}${w.substring(1).toLowerCase()}')
    .join(' ');
