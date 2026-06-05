import { api } from '../../lib/api';
import type {
  AdjustPayload,
  LowStockRow,
  MovementListResponse,
  RestockPayload,
} from './types';

export interface ListMovementsParams {
  productId?: string;
  variantId?: string;
  orderId?: string;
  page?: number;
  pageSize?: number;
}

export const inventoryApi = {
  lowStock: async (): Promise<LowStockRow[]> => {
    const res = await api.get<LowStockRow[]>('/inventory/low-stock');
    return res.data;
  },
  movements: async (params: ListMovementsParams = {}): Promise<MovementListResponse> => {
    const res = await api.get<MovementListResponse>('/inventory/movements', { params });
    return res.data;
  },
  restock: async (payload: RestockPayload): Promise<{ resultingStock: number }> => {
    const res = await api.post<{ resultingStock: number }>('/inventory/restock', payload);
    return res.data;
  },
  adjust: async (payload: AdjustPayload): Promise<{ resultingStock: number }> => {
    const res = await api.post<{ resultingStock: number }>('/inventory/adjust', payload);
    return res.data;
  },
};
