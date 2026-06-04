import { api } from '../../lib/api';
import type {
  Coupon,
  CouponListResponse,
  CouponValidation,
  CouponWritePayload,
} from './types';

export interface ListCouponsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export const couponsApi = {
  list: async (params: ListCouponsParams): Promise<CouponListResponse> => {
    const res = await api.get<CouponListResponse>('/coupons', { params });
    return res.data;
  },
  get: async (id: string): Promise<Coupon> => {
    const res = await api.get<Coupon>(`/coupons/${id}`);
    return res.data;
  },
  create: async (payload: CouponWritePayload): Promise<Coupon> => {
    const res = await api.post<Coupon>('/coupons', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<CouponWritePayload>): Promise<Coupon> => {
    const res = await api.patch<Coupon>(`/coupons/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },
  validate: async (code: string, subtotalCents: number): Promise<CouponValidation> => {
    const res = await api.post<CouponValidation>('/coupons/validate', { code, subtotalCents });
    return res.data;
  },
};
