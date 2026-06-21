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
  nameAr: string | null;
  nameCkb: string | null;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionCkb: string | null;
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
  nameAr?: string;
  nameCkb?: string;
  description?: string;
  descriptionAr?: string;
  descriptionCkb?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  attributeSchema?: AttributeDef[];
}
