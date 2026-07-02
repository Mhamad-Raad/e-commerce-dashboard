export interface CustomerCartItem {
  id: string;
  quantity: number;
  priceCents: number;
  variantName: string | null;
  product: { id: string; name: string; imageUrl: string | null; currency: string } | null;
}

export interface CustomerCart {
  id: string;
  status: string;
  discountCents: number;
  updatedAt: string;
  items: CustomerCartItem[];
}

export interface CustomerFavorite {
  id: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    priceCents: number;
    currency: string;
  } | null;
}

export type Gender = 'FEMALE' | 'MALE';

export interface Customer {
  id: string;
  email: string;
  name: string;
  gender: Gender | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  assistantEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  // Present only on the detail endpoint.
  carts?: CustomerCart[];
  favorites?: CustomerFavorite[];
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerWritePayload {
  email: string;
  name: string;
  // Required on create, omitted on edit when unknown (legacy customers).
  gender?: Gender;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  assistantEnabled?: boolean;
}
