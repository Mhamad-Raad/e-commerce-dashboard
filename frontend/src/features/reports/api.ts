import { api } from '../../lib/api';
import type {
  DateRangeParams,
  RecentOrder,
  ReportsSummary,
  TimeseriesPoint,
  TopProduct,
} from './types';

export const reportsApi = {
  summary: async (range: DateRangeParams = {}): Promise<ReportsSummary> => {
    const res = await api.get<ReportsSummary>('/reports/summary', { params: range });
    return res.data;
  },
  timeseries: async (range: DateRangeParams = {}): Promise<TimeseriesPoint[]> => {
    const res = await api.get<TimeseriesPoint[]>('/reports/timeseries', { params: range });
    return res.data;
  },
  topProducts: async (limit = 10, range: DateRangeParams = {}): Promise<TopProduct[]> => {
    const res = await api.get<TopProduct[]>('/reports/top-products', {
      params: { limit, ...range },
    });
    return res.data;
  },
  recentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    const res = await api.get<RecentOrder[]>('/reports/recent-orders', { params: { limit } });
    return res.data;
  },
};
