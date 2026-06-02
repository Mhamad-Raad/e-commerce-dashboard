import type { Product } from '@/features/products/types';
import type { Category } from '@/features/categories/types';
import type { Store } from '@/features/stores/types';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerWritePayload {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface HomepageData {
  banners: HeroBanner[];
  featuredProducts: Product[];
  featuredCategories: Category[];
  featuredStores: Store[];
}
