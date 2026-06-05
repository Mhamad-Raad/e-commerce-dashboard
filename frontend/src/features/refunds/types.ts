export const REFUND_STATUSES = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REFUND_REASONS = [
  'DAMAGED',
  'DEFECTIVE',
  'WRONG_ITEM',
  'NOT_AS_DESCRIBED',
  'ARRIVED_LATE',
  'CHANGED_MIND',
  'OTHER',
] as const;
export type RefundReason = (typeof REFUND_REASONS)[number];

// Status -> statuses you may transition to (mirrors the backend rules).
export const REFUND_TRANSITIONS: Record<RefundStatus, RefundStatus[]> = {
  REQUESTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'REJECTED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export interface RefundItem {
  id: string;
  orderItemId: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  quantity: number;
  priceCents: number;
}

export interface RefundOrderRef {
  id: string;
  number: string;
  totalCents: number;
  currency: string;
  customer: { id: string; name: string; email: string };
}

export interface Refund {
  id: string;
  number: string;
  orderId: string;
  status: RefundStatus;
  reason: RefundReason;
  note: string | null;
  amountCents: number;
  currency: string;
  restock: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: RefundItem[];
  order: RefundOrderRef;
}

export interface RefundListResponse {
  items: Refund[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RefundableItem {
  orderItemId: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  sku: string;
  priceCents: number;
  orderedQuantity: number;
  refundedQuantity: number;
  refundableQuantity: number;
}

export interface RefundableOrder {
  orderId: string;
  number: string;
  currency: string;
  items: RefundableItem[];
}

export interface CreateRefundPayload {
  orderId: string;
  reason: RefundReason;
  note?: string;
  restock?: boolean;
  items: { orderItemId: string; quantity: number }[];
  amountCents?: number;
}

export interface UpdateRefundPayload {
  status?: RefundStatus;
  reason?: RefundReason;
  note?: string;
  restock?: boolean;
  amountCents?: number;
}

export const refundStatusTone = (
  status: RefundStatus,
): 'green' | 'amber' | 'slate' | 'blue' | 'red' => {
  switch (status) {
    case 'REQUESTED':
      return 'amber';
    case 'APPROVED':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'CANCELLED':
      return 'slate';
  }
};
