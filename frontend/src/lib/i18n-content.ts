/**
 * Resolve a trilingual content value for the dashboard's current language,
 * falling back to English (the canonical value) when the translation is missing
 * or empty. Mirrors the backend's pick() so the live preview matches the app.
 */
export function pickLang(
  lang: string,
  en?: string | null,
  ar?: string | null,
  ckb?: string | null,
): string {
  const requested = lang === 'ar' ? ar : lang === 'ckb' ? ckb : en;
  return (requested && requested.trim()) || (en && en.trim()) || '';
}
