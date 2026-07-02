import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeseriesPoint } from '@/features/reports/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney, fromMinor } from '@/lib/format';

// Compact axis label from integer minor units, in the same units as the tooltip
// (IQD has no minor unit, so dividing by 100 under-reported revenue 100x).
const compactMoney = (minor: number) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(
    fromMinor(minor),
  );

const ORDERS_COLOR = 'oklch(0.62 0.19 255)'; // blue — readable on light & dark
const REVENUE_COLOR = 'var(--primary)'; // adapts to the active theme

/** Short axis label from an ISO date, e.g. "2026-06-03" -> "Jun 3". */
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

interface ChartProps {
  data: TimeseriesPoint[];
  loading?: boolean;
}

export function OrdersTimeseriesChart({ data, loading }: ChartProps) {
  const { t } = useTranslation();

  if (loading) return <Skeleton className="h-72 w-full" />;
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        {t('reports.no_orders')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          minTickGap={24}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
        />
        <YAxis
          yAxisId="orders"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <YAxis
          yAxisId="revenue"
          orientation="right"
          tickFormatter={(v) => compactMoney(Number(v))}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--popover-foreground)',
          }}
          labelFormatter={(label) => shortDate(String(label))}
          formatter={(value, name) =>
            name === t('reports.revenue_per_day')
              ? [formatMoney(Number(value)), name]
              : [value, name]
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          yAxisId="orders"
          dataKey="orders"
          name={t('reports.orders_per_day')}
          fill={ORDERS_COLOR}
          radius={[3, 3, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="revenue"
          type="monotone"
          dataKey="revenueCents"
          name={t('reports.revenue_per_day')}
          stroke={REVENUE_COLOR}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
