import { api } from '../../lib/api';
import type {
  CreateOrderPayload,
  Order,
  OrderListResponse,
  OrderStatus,
} from './types';

export interface ListOrdersParams {
  search?: string;
  status?: OrderStatus;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

export const ordersApi = {
  list: async (params: ListOrdersParams): Promise<OrderListResponse> => {
    const res = await api.get<OrderListResponse>('/orders', { params });
    return res.data;
  },
  get: async (id: string): Promise<Order> => {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await api.post<Order>('/orders', payload);
    return res.data;
  },
  update: async (
    id: string,
    payload: { status?: OrderStatus; trackingNumber?: string | null; notes?: string },
  ): Promise<Order> => {
    const res = await api.patch<Order>(`/orders/${id}`, payload);
    return res.data;
  },
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await api.patch<Order>(`/orders/${id}`, { status });
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

export const orderStatusTone = (status: OrderStatus): 'green' | 'amber' | 'slate' | 'blue' | 'red' => {
  switch (status) {
    case 'PENDING':
      return 'amber';
    case 'PAID':
      return 'blue';
    case 'PROCESSING':
      return 'amber';
    case 'SHIPPED':
      return 'blue';
    case 'OUT_FOR_DELIVERY':
      return 'blue';
    case 'DELIVERED':
      return 'green';
    case 'CANCELLED':
      return 'slate';
    case 'REFUNDED':
      return 'red';
  }
};
