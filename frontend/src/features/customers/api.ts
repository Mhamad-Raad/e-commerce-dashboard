import { api } from '../../lib/api';
import type { Customer, CustomerListResponse, CustomerWritePayload } from './types';

export interface ListCustomersParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const customersApi = {
  list: async (params: ListCustomersParams): Promise<CustomerListResponse> => {
    const res = await api.get<CustomerListResponse>('/customers', {
      params: {
        ...params,
        isActive: params.isActive === undefined ? undefined : String(params.isActive),
      },
    });
    return res.data;
  },
  get: async (id: string): Promise<Customer> => {
    const res = await api.get<Customer>(`/customers/${id}`);
    return res.data;
  },
  create: async (payload: CustomerWritePayload): Promise<Customer> => {
    const res = await api.post<Customer>('/customers', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<CustomerWritePayload>): Promise<Customer> => {
    const res = await api.patch<Customer>(`/customers/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
