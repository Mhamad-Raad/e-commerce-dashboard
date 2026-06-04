// Number of minor-unit digits per currency. Money is stored as an integer in the
// currency's minor unit; IQD has no minor unit in practice, so its integer holds
// whole dinars (exponent 0). Anything not listed defaults to 2 (cents-style).
const MINOR_DIGITS: Record<string, number> = {
  IQD: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
};

export const minorDigits = (currency = 'IQD') =>
  MINOR_DIGITS[currency.toUpperCase()] ?? 2;

/** Convert a decimal amount (what the user types) into integer minor units. */
export const toMinor = (amount: number, currency = 'IQD') =>
  Math.round(amount * 10 ** minorDigits(currency));

/** Convert integer minor units back into a decimal amount (for form inputs). */
export const fromMinor = (minor: number, currency = 'IQD') =>
  minor / 10 ** minorDigits(currency);

export const formatMoney = (minor: number, currency = 'IQD') => {
  const digits = minorDigits(currency);
  const value = minor / 10 ** digits;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${value.toFixed(digits)} ${currency}`;
  }
};

export const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const extractErrorMessage = (err: unknown): string => {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
    ?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return (err as Error)?.message ?? 'Something went wrong';
};
