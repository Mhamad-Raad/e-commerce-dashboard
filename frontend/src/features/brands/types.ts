export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface BrandListResponse {
  items: Brand[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BrandWritePayload {
  name: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}
