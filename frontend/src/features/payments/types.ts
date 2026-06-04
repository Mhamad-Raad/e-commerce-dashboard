export type PaymentMethod = 'COD' | 'TRANSFER' | 'CARD' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export const PAYMENT_METHODS: PaymentMethod[] = ['COD', 'TRANSFER', 'CARD', 'WALLET'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amountCents: number;
  reference: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentWritePayload {
  method: PaymentMethod;
  amountCents: number;
  status?: PaymentStatus;
  reference?: string;
  note?: string;
  paidAt?: string;
}
