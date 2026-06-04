export type DiscountType = 'PERCENT' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minSubtotalCents: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponListResponse {
  items: Coupon[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CouponWritePayload {
  code: string;
  type: DiscountType;
  value: number;
  minSubtotalCents?: number;
  maxRedemptions?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface CouponValidation {
  coupon: Coupon;
  discountCents: number;
}
