export interface ProductStoreRef {
  id: string;
  name: string;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  priceCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  storeId: string;
  store?: ProductStoreRef | null;
  categoryId: string | null;
  category?: ProductCategoryRef | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  currency?: string;
  stock: number;
  imageUrl?: string;
  storeId: string;
  categoryId?: string;
  isActive?: boolean;
}
