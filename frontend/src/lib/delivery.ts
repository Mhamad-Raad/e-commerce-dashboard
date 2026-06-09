import type { Product } from '@/features/products/types';

export interface LeadWindow {
  min: number;
  max: number;
  // true when the window comes from the store default rather than a product override.
  inherited: boolean;
}

/**
 * Resolve a product's effective estimated-delivery window (in days). A product's
 * own override wins; otherwise it inherits the store's default. Returns null when
 * neither is known (e.g. a list row without the store loaded).
 */
export function resolveLeadWindow(
  product: Pick<Product, 'minLeadDays' | 'maxLeadDays' | 'store'>,
): LeadWindow | null {
  if (product.minLeadDays != null && product.maxLeadDays != null) {
    return { min: product.minLeadDays, max: product.maxLeadDays, inherited: false };
  }
  const store = product.store;
  if (store?.minLeadDays != null && store?.maxLeadDays != null) {
    return { min: store.minLeadDays, max: store.maxLeadDays, inherited: true };
  }
  return null;
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const shortDate = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/**
 * Turn a lead-day window into the calendar range a shopper would see, relative to
 * a placement date (defaults to today). e.g. { from: "Jun 13", to: "Jun 17" }.
 */
export function arrivalDateRange(min: number, max: number, from: Date = new Date()) {
  return { from: shortDate(addDays(from, min)), to: shortDate(addDays(from, max)) };
}
