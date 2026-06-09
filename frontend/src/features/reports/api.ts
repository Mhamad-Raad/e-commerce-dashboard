import { api } from '../../lib/api';
import type {
  ChargesBreakdown,
  DateRangeParams,
  DimensionSales,
  GovernorateSales,
  RecentOrder,
  RefundStats,
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
  salesByStore: async (range: DateRangeParams = {}): Promise<DimensionSales[]> => {
    const res = await api.get<DimensionSales[]>('/reports/sales-by-store', { params: range });
    return res.data;
  },
  salesByGovernorate: async (range: DateRangeParams = {}): Promise<GovernorateSales[]> => {
    const res = await api.get<GovernorateSales[]>('/reports/sales-by-governorate', { params: range });
    return res.data;
  },
  charges: async (range: DateRangeParams = {}): Promise<ChargesBreakdown> => {
    const res = await api.get<ChargesBreakdown>('/reports/charges', { params: range });
    return res.data;
  },
  refundStats: async (range: DateRangeParams = {}): Promise<RefundStats> => {
    const res = await api.get<RefundStats>('/reports/refund-stats', { params: range });
    return res.data;
  },
};
