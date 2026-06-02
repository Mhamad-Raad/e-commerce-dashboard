import { api } from '../../lib/api';
import type { Product } from '@/features/products/types';
import type { Category } from '@/features/categories/types';
import type { Store } from '@/features/stores/types';
import type { BannerWritePayload, HeroBanner, HomepageData } from './types';

export const homepageApi = {
  get: async (): Promise<HomepageData> => {
    const res = await api.get<HomepageData>('/homepage');
    return res.data;
  },
  createBanner: async (payload: BannerWritePayload): Promise<HeroBanner> => {
    const res = await api.post<HeroBanner>('/homepage/banners', payload);
    return res.data;
  },
  updateBanner: async (id: string, payload: Partial<BannerWritePayload>): Promise<HeroBanner> => {
    const res = await api.patch<HeroBanner>(`/homepage/banners/${id}`, payload);
    return res.data;
  },
  removeBanner: async (id: string): Promise<void> => {
    await api.delete(`/homepage/banners/${id}`);
  },
  setFeaturedProducts: async (ids: string[]): Promise<Product[]> => {
    const res = await api.put<Product[]>('/homepage/featured/products', { ids });
    return res.data;
  },
  setFeaturedCategories: async (ids: string[]): Promise<Category[]> => {
    const res = await api.put<Category[]>('/homepage/featured/categories', { ids });
    return res.data;
  },
  setFeaturedStores: async (ids: string[]): Promise<Store[]> => {
    const res = await api.put<Store[]>('/homepage/featured/stores', { ids });
    return res.data;
  },
};
