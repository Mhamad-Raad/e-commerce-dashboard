import { api } from '../../lib/api';
import type { Order } from '../orders/types';
import type { PaymentMethod } from '../payments/types';
import type { Cart, CartListResponse, CartStatus } from './types';

export interface CheckoutPayload {
  addressId: string;
  paymentMethod: PaymentMethod;
  markPaid?: boolean;
  notes?: string;
  taxCents?: number;
  shippingCents?: number;
}

export interface ListCartsParams {
  search?: string;
  status?: CartStatus;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

export const cartsApi = {
  list: async (params: ListCartsParams): Promise<CartListResponse> => {
    const res = await api.get<CartListResponse>('/carts', { params });
    return res.data;
  },
  get: async (id: string): Promise<Cart> => {
    const res = await api.get<Cart>(`/carts/${id}`);
    return res.data;
  },
  create: async (payload: { customerId: string; status?: CartStatus }): Promise<Cart> => {
    const res = await api.post<Cart>('/carts', payload);
    return res.data;
  },
  updateStatus: async (id: string, status: CartStatus): Promise<Cart> => {
    const res = await api.patch<Cart>(`/carts/${id}`, { status });
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/carts/${id}`);
  },
  addItem: async (
    cartId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<Cart> => {
    const res = await api.post<Cart>(`/carts/${cartId}/items`, {
      productId,
      quantity,
      variantId: variantId || undefined,
    });
    return res.data;
  },
  updateItem: async (cartId: string, itemId: string, quantity: number): Promise<Cart> => {
    const res = await api.patch<Cart>(`/carts/${cartId}/items/${itemId}`, { quantity });
    return res.data;
  },
  removeItem: async (cartId: string, itemId: string): Promise<Cart> => {
    const res = await api.delete<Cart>(`/carts/${cartId}/items/${itemId}`);
    return res.data;
  },
  applyCoupon: async (cartId: string, code: string): Promise<Cart> => {
    const res = await api.post<Cart>(`/carts/${cartId}/coupon`, { code });
    return res.data;
  },
  removeCoupon: async (cartId: string): Promise<Cart> => {
    const res = await api.delete<Cart>(`/carts/${cartId}/coupon`);
    return res.data;
  },
  checkout: async (cartId: string, payload: CheckoutPayload): Promise<Order> => {
    const res = await api.post<Order>(`/carts/${cartId}/checkout`, payload);
    return res.data;
  },
};

export const cartStatusTone = (status: CartStatus): 'green' | 'amber' | 'slate' => {
  switch (status) {
    case 'OPEN':
      return 'green';
    case 'CHECKED_OUT':
      return 'slate';
    case 'ABANDONED':
      return 'amber';
  }
};
