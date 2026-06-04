export interface ProductStoreRef {
  id: string;
  name: string;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceCents: number;
  salePriceCents: number | null;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  priceCents: number;
  salePriceCents: number | null;
  currency: string;
  stock: number;
  imageUrl: string | null;
  storeId: string;
  store?: ProductStoreRef | null;
  categoryId: string | null;
  category?: ProductCategoryRef | null;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  _count?: { variants: number };
}

export interface VariantWritePayload {
  name: string;
  sku: string;
  priceCents: number;
  salePriceCents?: number | null;
  stock: number;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductWritePayload {
  name: string;
  description?: string;
  sku: string;
  priceCents: number;
  salePriceCents?: number | null;
  currency?: string;
  stock: number;
  imageUrl?: string;
  storeId: string;
  categoryId?: string;
  isActive?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
}
