export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  assistantEnabled: boolean;
  createdAt: string;
  updatedAt: string;
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
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  assistantEnabled?: boolean;
}
