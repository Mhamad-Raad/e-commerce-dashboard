/** Supported content languages. English is the canonical/main value. */
export type Lang = 'en' | 'ar' | 'ckb';

export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'ar', 'ckb'];

/** Coerce a `?lang=` query value to a supported Lang (defaults to English). */
export function toLang(raw: unknown): Lang {
  return raw === 'ar' || raw === 'ckb' ? raw : 'en';
}

/**
 * Resolve a trilingual field for `lang`, falling back to English (the main
 * value) when the requested translation is **missing OR empty**. Used to shape
 * public/storefront payloads.
 */
export function pick(
  lang: Lang,
  en: string | null | undefined,
  ar?: string | null,
  ckb?: string | null,
): string | null {
  const requested = lang === 'ar' ? ar : lang === 'ckb' ? ckb : en;
  const nonEmpty = (v: string | null | undefined) =>
    v != null && v.trim() !== '' ? v : null;
  return nonEmpty(requested) ?? nonEmpty(en) ?? null;
}
