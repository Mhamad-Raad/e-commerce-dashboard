import { api } from '../../lib/api';
import type { RecentOrder, ReportsSummary, TopProduct } from './types';

export const reportsApi = {
  summary: async (): Promise<ReportsSummary> => {
    const res = await api.get<ReportsSummary>('/reports/summary');
    return res.data;
  },
  topProducts: async (limit = 10): Promise<TopProduct[]> => {
    const res = await api.get<TopProduct[]>('/reports/top-products', { params: { limit } });
    return res.data;
  },
  recentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    const res = await api.get<RecentOrder[]>('/reports/recent-orders', { params: { limit } });
    return res.data;
  },
};
