import { api } from '../../lib/api';
import type {
  Store,
  StoreDetail,
  StoreListResponse,
  StoreWritePayload,
} from './types';

export interface ListStoresParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const storesApi = {
  list: async (params: ListStoresParams = {}): Promise<StoreListResponse> => {
    const res = await api.get<StoreListResponse>('/stores', {
      params: {
        ...params,
        isActive: params.isActive === undefined ? undefined : String(params.isActive),
      },
    });
    return res.data;
  },
  get: async (id: string): Promise<StoreDetail> => {
    const res = await api.get<StoreDetail>(`/stores/${id}`);
    return res.data;
  },
  create: async (payload: StoreWritePayload): Promise<Store> => {
    const res = await api.post<Store>('/stores', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<StoreWritePayload>): Promise<Store> => {
    const res = await api.patch<Store>(`/stores/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },
};
