import { api } from '../../lib/api';
import type { Address, AddressWritePayload } from './types';

export const addressesApi = {
  list: async (customerId: string): Promise<Address[]> => {
    const res = await api.get<Address[]>(`/customers/${customerId}/addresses`);
    return res.data;
  },
  create: async (customerId: string, payload: AddressWritePayload): Promise<Address> => {
    const res = await api.post<Address>(`/customers/${customerId}/addresses`, payload);
    return res.data;
  },
  update: async (
    customerId: string,
    id: string,
    payload: Partial<AddressWritePayload>,
  ): Promise<Address> => {
    const res = await api.patch<Address>(`/customers/${customerId}/addresses/${id}`, payload);
    return res.data;
  },
  remove: async (customerId: string, id: string): Promise<void> => {
    await api.delete(`/customers/${customerId}/addresses/${id}`);
  },
};
