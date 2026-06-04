import { City, Governorate } from '@prisma/client';

/**
 * Which cities belong to which governorate. Used to validate that an address's
 * city is consistent with its governorate, and to drive the dependent city
 * dropdown on the frontend (mirrored in frontend/src/lib/iraqGeo.ts).
 */
export const GOVERNORATE_CITIES: Record<Governorate, City[]> = {
  BAGHDAD: [City.BAGHDAD, City.ABU_GHRAIB, City.MAHMUDIYAH, City.TARMIYAH, City.SADR_CITY],
  BASRA: [City.BASRA, City.ZUBAIR, City.ABU_AL_KHASIB, City.QURNA, City.FAW],
  NINEVEH: [City.MOSUL, City.TAL_AFAR, City.SINJAR, City.HAMDANIYA, City.SHEIKHAN],
  ERBIL: [City.ERBIL, City.SHAQLAWA, City.KOYA, City.SORAN, City.CHOMAN],
  SULAYMANIYAH: [City.SULAYMANIYAH, City.RANIA, City.CHAMCHAMAL, City.KALAR, City.DUKAN],
  DUHOK: [City.DUHOK, City.ZAKHO, City.AMEDI, City.SEMEL, City.AKRE],
  KIRKUK: [City.KIRKUK, City.HAWIJA, City.DAQUQ, City.DIBIS],
  NAJAF: [City.NAJAF, City.KUFA, City.MISHKHAB, City.MANATHERA],
  KARBALA: [City.KARBALA, City.AIN_AL_TAMR, City.HINDIYA],
  BABYLON: [City.HILLAH, City.MUSAYYIB, City.MAHAWIL, City.HASHIMIYA],
  WASIT: [City.KUT, City.SUWAIRA, City.NUMANIYA, City.AZIZIYA, City.BADRA],
  MAYSAN: [City.AMARAH, City.MAJAR_AL_KABIR, City.ALI_AL_GHARBI, City.QALAT_SALIH],
  DHI_QAR: [City.NASIRIYAH, City.SHATRA, City.RIFAI, City.SUQ_AL_SHUYUKH, City.CHIBAYISH],
  MUTHANNA: [City.SAMAWAH, City.RUMAITHA, City.KHIDHIR, City.SALMAN],
  QADISIYYAH: [City.DIWANIYAH, City.AFAK, City.SHAMIYA, City.HAMZA],
  DIYALA: [City.BAQUBAH, City.MUQDADIYAH, City.KHALIS, City.KHANAQIN, City.BALADRUZ],
  ANBAR: [City.RAMADI, City.FALLUJAH, City.HIT, City.HADITHA, City.QAIM, City.RUTBA],
  SALADIN: [City.TIKRIT, City.SAMARRA, City.BALAD, City.DUJAIL, City.SHIRQAT, City.BAIJI],
  HALABJA: [City.HALABJA, City.KHURMAL, City.SAYID_SADIQ, City.BIYARA],
};

/** True when `city` is a valid city of `governorate`. */
export const cityInGovernorate = (governorate: Governorate, city: City): boolean =>
  GOVERNORATE_CITIES[governorate]?.includes(city) ?? false;
