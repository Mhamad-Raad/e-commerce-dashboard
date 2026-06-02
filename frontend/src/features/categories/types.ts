export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CategoryWritePayload {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}
