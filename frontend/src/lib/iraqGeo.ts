// Mirrors backend src/common/iraq-geo.ts. Drives the dependent governorate/city
// dropdowns. Enum values match the Prisma enums exactly; we humanize for display.

export const GOVERNORATES = [
  'BAGHDAD', 'BASRA', 'NINEVEH', 'ERBIL', 'SULAYMANIYAH', 'DUHOK', 'KIRKUK',
  'NAJAF', 'KARBALA', 'BABYLON', 'WASIT', 'MAYSAN', 'DHI_QAR', 'MUTHANNA',
  'QADISIYYAH', 'DIYALA', 'ANBAR', 'SALADIN', 'HALABJA',
] as const;

export type Governorate = (typeof GOVERNORATES)[number];

export const GOVERNORATE_CITIES: Record<Governorate, string[]> = {
  BAGHDAD: ['BAGHDAD', 'ABU_GHRAIB', 'MAHMUDIYAH', 'TARMIYAH', 'SADR_CITY'],
  BASRA: ['BASRA', 'ZUBAIR', 'ABU_AL_KHASIB', 'QURNA', 'FAW'],
  NINEVEH: ['MOSUL', 'TAL_AFAR', 'SINJAR', 'HAMDANIYA', 'SHEIKHAN'],
  ERBIL: ['ERBIL', 'SHAQLAWA', 'KOYA', 'SORAN', 'CHOMAN'],
  SULAYMANIYAH: ['SULAYMANIYAH', 'RANIA', 'CHAMCHAMAL', 'KALAR', 'DUKAN'],
  DUHOK: ['DUHOK', 'ZAKHO', 'AMEDI', 'SEMEL', 'AKRE'],
  KIRKUK: ['KIRKUK', 'HAWIJA', 'DAQUQ', 'DIBIS'],
  NAJAF: ['NAJAF', 'KUFA', 'MISHKHAB', 'MANATHERA'],
  KARBALA: ['KARBALA', 'AIN_AL_TAMR', 'HINDIYA'],
  BABYLON: ['HILLAH', 'MUSAYYIB', 'MAHAWIL', 'HASHIMIYA'],
  WASIT: ['KUT', 'SUWAIRA', 'NUMANIYA', 'AZIZIYA', 'BADRA'],
  MAYSAN: ['AMARAH', 'MAJAR_AL_KABIR', 'ALI_AL_GHARBI', 'QALAT_SALIH'],
  DHI_QAR: ['NASIRIYAH', 'SHATRA', 'RIFAI', 'SUQ_AL_SHUYUKH', 'CHIBAYISH'],
  MUTHANNA: ['SAMAWAH', 'RUMAITHA', 'KHIDHIR', 'SALMAN'],
  QADISIYYAH: ['DIWANIYAH', 'AFAK', 'SHAMIYA', 'HAMZA'],
  DIYALA: ['BAQUBAH', 'MUQDADIYAH', 'KHALIS', 'KHANAQIN', 'BALADRUZ'],
  ANBAR: ['RAMADI', 'FALLUJAH', 'HIT', 'HADITHA', 'QAIM', 'RUTBA'],
  SALADIN: ['TIKRIT', 'SAMARRA', 'BALAD', 'DUJAIL', 'SHIRQAT', 'BAIJI'],
  HALABJA: ['HALABJA', 'KHURMAL', 'SAYID_SADIQ', 'BIYARA'],
};

/** Turn an enum value like DHI_QAR / SADR_CITY into "Dhi Qar" / "Sadr City". */
export const humanizeGeo = (value?: string | null): string =>
  value
    ? value
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ')
    : '';
