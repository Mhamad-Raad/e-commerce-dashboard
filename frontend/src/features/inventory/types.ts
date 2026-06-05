export type StockMovementReason =
  | 'ORDER'
  | 'ORDER_CANCELLED'
  | 'RESTOCK'
  | 'ADJUSTMENT';

export const STOCK_MOVEMENT_REASONS: StockMovementReason[] = [
  'ORDER',
  'ORDER_CANCELLED',
  'RESTOCK',
  'ADJUSTMENT',
];

export interface LowStockRow {
  productId: string;
  productName: string;
  sku: string;
  variantId: string | null;
  variantName: string | null;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string | null;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: { id: string; name: string; sku: string } | null;
  variantId: string | null;
  variant: { id: string; name: string } | null;
  delta: number;
  resultingStock: number;
  reason: StockMovementReason;
  note: string | null;
  orderId: string | null;
  order: { id: string; number: string } | null;
  createdAt: string;
}

export interface MovementListResponse {
  items: StockMovement[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RestockPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  note?: string;
}

export interface AdjustPayload {
  productId: string;
  variantId?: string;
  delta: number;
  note?: string;
}
