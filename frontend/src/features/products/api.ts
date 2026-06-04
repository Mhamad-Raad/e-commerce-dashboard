import { api } from '../../lib/api';
import type {
  Product,
  ProductListResponse,
  ProductVariant,
  ProductWritePayload,
  VariantWritePayload,
} from './types';

export interface ListProductsParams {
  search?: string;
  storeId?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const productsApi = {
  list: async (params: ListProductsParams): Promise<ProductListResponse> => {
    const res = await api.get<ProductListResponse>('/products', {
      params: {
        ...params,
        isActive: params.isActive === undefined ? undefined : String(params.isActive),
      },
    });
    return res.data;
  },
  get: async (id: string): Promise<Product> => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },
  create: async (payload: ProductWritePayload): Promise<Product> => {
    const res = await api.post<Product>('/products', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<ProductWritePayload>): Promise<Product> => {
    const res = await api.patch<Product>(`/products/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const variantsApi = {
  list: async (productId: string): Promise<ProductVariant[]> => {
    const res = await api.get<ProductVariant[]>(`/products/${productId}/variants`);
    return res.data;
  },
  create: async (
    productId: string,
    payload: VariantWritePayload,
  ): Promise<ProductVariant> => {
    const res = await api.post<ProductVariant>(`/products/${productId}/variants`, payload);
    return res.data;
  },
  update: async (
    productId: string,
    id: string,
    payload: Partial<VariantWritePayload>,
  ): Promise<ProductVariant> => {
    const res = await api.patch<ProductVariant>(
      `/products/${productId}/variants/${id}`,
      payload,
    );
    return res.data;
  },
  remove: async (productId: string, id: string): Promise<void> => {
    await api.delete(`/products/${productId}/variants/${id}`);
  },
};
