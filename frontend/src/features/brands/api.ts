import { api } from '../../lib/api';
import type { Brand, BrandListResponse, BrandWritePayload } from './types';

export interface ListBrandsParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const brandsApi = {
  list: async (params: ListBrandsParams = {}): Promise<BrandListResponse> => {
    const res = await api.get<BrandListResponse>('/brands', {
      params: {
        ...params,
        isActive: params.isActive === undefined ? undefined : String(params.isActive),
      },
    });
    return res.data;
  },
  get: async (id: string): Promise<Brand> => {
    const res = await api.get<Brand>(`/brands/${id}`);
    return res.data;
  },
  create: async (payload: BrandWritePayload): Promise<Brand> => {
    const res = await api.post<Brand>('/brands', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<BrandWritePayload>): Promise<Brand> => {
    const res = await api.patch<Brand>(`/brands/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  },
};
