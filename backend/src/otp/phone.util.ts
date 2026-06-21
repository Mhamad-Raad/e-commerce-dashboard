// Normalize Iraqi phone input to E.164 (+9647XXXXXXXXX). The app stores and
// looks up customers by this canonical form so "0770 123 4567", "+964 770…",
// "00964770…" and "770…" all resolve to one identity.
//
// Iraqi mobile numbers: country code 964, national number is 10 digits starting
// with 7 (e.g. 770/771/772/750/751/780/781…). With the trunk prefix it is
// written 07XXXXXXXXX (11 digits). Landlines are rejected — OTP is WhatsApp-only.

const IRAQ_MOBILE = /^7\d{9}$/; // 10 national digits, leading 7

/**
 * Returns the +9647XXXXXXXXX form, or null when the input is not a valid Iraqi
 * mobile number. Callers should throw BadRequest on null.
 */
export function normalizeIraqiPhone(raw: string): string | null {
  if (!raw) return null;

  // Keep digits only, but remember a leading + so we can treat it as E.164.
  const hadPlus = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');

  // Strip the various country-code / trunk prefixes down to the 10-digit
  // national number.
  if (hadPlus && digits.startsWith('964')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('00964')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('964') && digits.length > 10) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return IRAQ_MOBILE.test(digits) ? `+964${digits}` : null;
}
