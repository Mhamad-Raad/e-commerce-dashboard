import { api } from '../../lib/api';
import type {
  CreateRefundPayload,
  Refund,
  RefundableOrder,
  RefundListResponse,
  RefundStatus,
  UpdateRefundPayload,
} from './types';

export interface ListRefundsParams {
  search?: string;
  status?: RefundStatus;
  orderId?: string;
  page?: number;
  pageSize?: number;
}

export const refundsApi = {
  list: async (params: ListRefundsParams = {}): Promise<RefundListResponse> => {
    const res = await api.get<RefundListResponse>('/refunds', { params });
    return res.data;
  },
  get: async (id: string): Promise<Refund> => {
    const res = await api.get<Refund>(`/refunds/${id}`);
    return res.data;
  },
  refundable: async (orderId: string): Promise<RefundableOrder> => {
    const res = await api.get<RefundableOrder>(`/refunds/refundable/${orderId}`);
    return res.data;
  },
  create: async (payload: CreateRefundPayload): Promise<Refund> => {
    const res = await api.post<Refund>('/refunds', payload);
    return res.data;
  },
  update: async (id: string, payload: UpdateRefundPayload): Promise<Refund> => {
    const res = await api.patch<Refund>(`/refunds/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/refunds/${id}`);
  },
};
