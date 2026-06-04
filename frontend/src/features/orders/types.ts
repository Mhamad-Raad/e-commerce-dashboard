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
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  status: OrderStatus;
  placedAt: string;
  updatedAt: string;
  customer: OrderCustomerSummary;
  items: OrderItem[];
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
}
