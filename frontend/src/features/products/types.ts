export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  priceCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  category: string | null;
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
  category?: string;
  isActive?: boolean;
}
