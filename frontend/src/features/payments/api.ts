import { api } from '../../lib/api';
import type { Payment, PaymentWritePayload } from './types';

export const paymentsApi = {
  list: async (orderId: string): Promise<Payment[]> => {
    const res = await api.get<Payment[]>(`/orders/${orderId}/payments`);
    return res.data;
  },
  create: async (orderId: string, payload: PaymentWritePayload): Promise<Payment> => {
    const res = await api.post<Payment>(`/orders/${orderId}/payments`, payload);
    return res.data;
  },
  update: async (
    orderId: string,
    id: string,
    payload: Partial<PaymentWritePayload>,
  ): Promise<Payment> => {
    const res = await api.patch<Payment>(`/orders/${orderId}/payments/${id}`, payload);
    return res.data;
  },
  remove: async (orderId: string, id: string): Promise<void> => {
    await api.delete(`/orders/${orderId}/payments/${id}`);
  },
};
