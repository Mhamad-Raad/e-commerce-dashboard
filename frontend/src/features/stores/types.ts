export interface Store {
  id: string;
  name: string;
  nameAr: string | null;
  nameCkb: string | null;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  descriptionCkb: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  feeGroupId: string | null;
  feeGroup?: { id: string; name: string } | null;
  // Default estimated-delivery window (days) for this store's products.
  minLeadDays: number;
  maxLeadDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface StoreProduct {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  category?: { id: string; name: string } | null;
}

export interface StoreDetail extends Store {
  products: StoreProduct[];
}

export interface StoreListResponse {
  items: Store[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StoreWritePayload {
  name: string;
  nameAr?: string;
  nameCkb?: string;
  description?: string;
  descriptionAr?: string;
  descriptionCkb?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  feeGroupId?: string | null;
  minLeadDays?: number;
  maxLeadDays?: number;
  isActive?: boolean;
}
