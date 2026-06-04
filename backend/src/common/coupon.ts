import { Coupon } from '@prisma/client';

/** Discount amount (in minor units) a coupon yields for a given subtotal. */
export const couponDiscountCents = (
  coupon: Pick<Coupon, 'type' | 'value'>,
  subtotalCents: number,
): number => {
  const raw =
    coupon.type === 'PERCENT'
      ? Math.floor((subtotalCents * coupon.value) / 100)
      : coupon.value;
  return Math.max(0, Math.min(subtotalCents, raw));
};

/**
 * Returns null when the coupon can be applied to this subtotal, otherwise a
 * human-readable reason it can't (inactive, out of window, exhausted, below min).
 */
export const couponApplicabilityError = (
  coupon: Coupon | null,
  subtotalCents: number,
  now: Date,
): string | null => {
  if (!coupon) return 'Coupon not found';
  if (!coupon.isActive) return 'Coupon is not active';
  if (coupon.startsAt && now < coupon.startsAt) return 'Coupon is not active yet';
  if (coupon.expiresAt && now > coupon.expiresAt) return 'Coupon has expired';
  if (coupon.maxRedemptions != null && coupon.redeemedCount >= coupon.maxRedemptions) {
    return 'Coupon redemption limit reached';
  }
  if (subtotalCents < coupon.minSubtotalCents) {
    return 'Subtotal is below the coupon minimum';
  }
  return null;
};
