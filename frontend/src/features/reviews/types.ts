export interface ReviewProductRef {
  id: string;
  name: string;
}

export interface ReviewCustomerRef {
  id: string;
  name: string;
  email?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  product?: ReviewProductRef;
  customer?: ReviewCustomerRef;
}

export interface ReviewListResponse {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewWritePayload {
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved?: boolean;
}

export interface ReviewUpdatePayload {
  rating?: number;
  title?: string;
  comment?: string;
  isApproved?: boolean;
}
