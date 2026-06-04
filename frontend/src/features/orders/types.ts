import type { Payment } from '../payments/types';

// Single source of truth for order statuses on the frontend. Mirrors the
// Prisma `OrderStatus` enum (backend is canonical) — keep the two in sync.
// The array order is the lifecycle order shown in dropdowns.
export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderCustomerSummary {
  id: string;
  name: string;
  email: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  name: string;
  sku: string;
  quantity: number;
  priceCents: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  subtotalCents: number;
  discountCents: number;
  couponCode: string | null;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  status: OrderStatus;
  placedAt: string;
  updatedAt: string;
  shipName: string | null;
  shipPhone: string | null;
  shipGovernorate: string | null;
  shipCity: string | null;
  shipDistrict: string | null;
  shipStreet: string | null;
  shipLandmark: string | null;
  notes: string | null;
  trackingNumber: string | null;
  customer: OrderCustomerSummary;
  items: OrderItem[];
  payments?: Payment[];
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderPayload {
  customerId: string;
  items: Array<{ productId: string; variantId?: string; quantity: number }>;
  taxCents?: number;
  shippingCents?: number;
  currency?: string;
  addressId?: string;
  couponCode?: string;
}
