export interface FeeGroup {
  id: string;
  name: string;
  label: string;
  feeCents: number;
  taxRatePct: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { stores: number };
}

export interface FeeGroupListResponse {
  items: FeeGroup[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FeeGroupWritePayload {
  name: string;
  label: string;
  feeCents?: number;
  taxRatePct?: number;
  isActive?: boolean;
}
