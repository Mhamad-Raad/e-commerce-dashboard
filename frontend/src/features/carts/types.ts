export type CartStatus = 'OPEN' | 'CHECKED_OUT' | 'ABANDONED';

export interface CartCustomerSummary {
  id: string;
  name: string;
  email: string;
}

export interface CartItemProductSummary {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  priceCents: number;
  product: CartItemProductSummary;
}

export interface Cart {
  id: string;
  customerId: string;
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
  customer: CartCustomerSummary;
  items: CartItem[];
}

export interface CartListResponse {
  items: Cart[];
  total: number;
  page: number;
  pageSize: number;
}

export const cartTotalCents = (cart: Pick<Cart, 'items'>) =>
  cart.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
