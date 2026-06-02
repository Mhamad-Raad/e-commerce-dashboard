import { api } from '../../lib/api';
import type {
  Category,
  CategoryListResponse,
  CategoryWritePayload,
} from './types';

export interface ListCategoriesParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const categoriesApi = {
  list: async (params: ListCategoriesParams = {}): Promise<CategoryListResponse> => {
    const res = await api.get<CategoryListResponse>('/categories', {
      params: {
        ...params,
        isActive: params.isActive === undefined ? undefined : String(params.isActive),
      },
    });
    return res.data;
  },
  get: async (id: string): Promise<Category> => {
    const res = await api.get<Category>(`/categories/${id}`);
    return res.data;
  },
  create: async (payload: CategoryWritePayload): Promise<Category> => {
    const res = await api.post<Category>('/categories', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<CategoryWritePayload>): Promise<Category> => {
    const res = await api.patch<Category>(`/categories/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
