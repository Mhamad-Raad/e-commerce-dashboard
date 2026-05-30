import type { OrderStatus } from '../orders/types';

export interface ReportsSummary {
  revenueCents: number;
  orderCount: number;
  aovCents: number;
  customerCount: number;
  productCount: number;
  ordersByStatus: Array<{ status: OrderStatus; count: number }>;
}

export interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  currency: string;
  revenueCents: number;
  units: number;
}

export interface RecentOrder {
  id: string;
  number: string;
  totalCents: number;
  currency: string;
  status: OrderStatus;
  placedAt: string;
  customer: { id: string; name: string; email: string };
}
