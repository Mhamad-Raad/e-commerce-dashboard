export type AttributeType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect';

/** One attribute definition in a category's schema (drives the product form). */
export interface AttributeDef {
  key: string;
  label: string;
  type: AttributeType;
  options?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  attributeSchema: AttributeDef[];
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
  imageUrl?: string | null;
  isActive?: boolean;
  attributeSchema?: AttributeDef[];
}
