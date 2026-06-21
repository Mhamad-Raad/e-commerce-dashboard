import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ar from './locales/ar.json';
import ckb from './locales/ckb.json';

export const SUPPORTED_LANGUAGES = ['en', 'ar', 'ckb'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Arabic and Kurdish Sorani (ckb) are RTL. Kurdish strings fall back to English
// (fallbackLng) for keys not yet translated in ckb.json.
const RTL_LANGS = ['ar', 'ckb'];

function applyDirection(lng: string | undefined) {
  const lang = lng === 'ar' ? 'ar' : lng === 'ckb' ? 'ckb' : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      ckb: { translation: ckb },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

applyDirection(i18n.resolvedLanguage);
i18n.on('languageChanged', applyDirection);

export default i18n;
