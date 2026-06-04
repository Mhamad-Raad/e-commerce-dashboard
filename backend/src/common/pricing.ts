/**
 * The price actually charged for a product/variant: the sale price when it is
 * set and genuinely lower than the base price, otherwise the base price.
 */
export const effectivePriceCents = (
  priceCents: number,
  salePriceCents?: number | null,
): number =>
  salePriceCents != null && salePriceCents >= 0 && salePriceCents < priceCents
    ? salePriceCents
    : priceCents;
