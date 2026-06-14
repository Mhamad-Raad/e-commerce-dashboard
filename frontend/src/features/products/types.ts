export interface ProductStoreRef {
  id: string;
  name: string;
  // Store's default delivery window — present on the full product (store: true)
  // so the dashboard can resolve a product's effective estimated arrival.
  minLeadDays?: number;
  maxLeadDays?: number;
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
  lowStockThreshold: number;
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
  lowStockThreshold: number;
  // Per-product delivery-window override (in days); null on either = inherit store.
  minLeadDays: number | null;
  maxLeadDays: number | null;
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
  lowStockThreshold?: number;
  imageUrl?: string | null;
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
  lowStockThreshold?: number;
  minLeadDays?: number | null;
  maxLeadDays?: number | null;
  imageUrl?: string | null;
  storeId: string;
  categoryId?: string;
  isActive?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
}
