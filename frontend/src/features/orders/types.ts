import type { Payment } from '../payments/types';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

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
