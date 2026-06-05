import type { OrderStatus } from '../orders/types';

export interface ReportsSummary {
  revenueCents: number;
  orderCount: number;
  aovCents: number;
  customerCount: number;
  productCount: number;
  range: { start: string; end: string };
  ordersByStatus: Array<{ status: OrderStatus; count: number }>;
}

export interface TimeseriesPoint {
  date: string;
  orders: number;
  revenueCents: number;
}

export interface DateRangeParams {
  start?: string;
  end?: string;
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

export interface DimensionSales {
  name: string;
  revenueCents: number;
  units: number;
}

export interface GovernorateSales {
  governorate: string | null;
  revenueCents: number;
  orders: number;
}

export interface ChargesBreakdown {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  feesCents: number;
  totalCents: number;
}

export interface RefundStats {
  byStatus: Array<{ status: string; count: number; amountCents: number }>;
  completedCents: number;
}
