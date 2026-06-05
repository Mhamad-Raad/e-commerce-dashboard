import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { reportsApi } from '@/features/reports/api';
import { orderStatusTone } from '@/features/orders/api';
import type { OrderStatus } from '@/features/orders/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TablePagination } from '@/components/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatMoney } from '@/lib/format';
import { humanizeGeo } from '@/lib/iraqGeo';
import { refundStatusTone } from '@/features/refunds/types';
import { OrdersTimeseriesChart } from './OrdersTimeseriesChart';

const PRESETS = [7, 30, 60, 90];
const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_WINDOW = 50;

const todayISO = () => new Date(Date.now()).toISOString().slice(0, 10);
const daysAgoISO = (n: number) => new Date(Date.now() - (n - 1) * DAY_MS).toISOString().slice(0, 10);

export function Reports() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const range = { start: start || undefined, end: end || undefined };

  const activePreset =
    !start && !end
      ? 60
      : PRESETS.find((n) => start === daysAgoISO(n) && end === todayISO()) ?? null;

  const setRange = (next: { start?: string; end?: string }) => {
    const p = new URLSearchParams(params);
    if (next.start) p.set('start', next.start);
    else p.delete('start');
    if (next.end) p.set('end', next.end);
    else p.delete('end');
    setParams(p, { replace: true });
  };
  const setPreset = (n: number) => setRange({ start: daysAgoISO(n), end: todayISO() });
  const setField = (field: 'start' | 'end', value: string) =>
    setRange({ start, end, [field]: value });

  const summary = useQuery({
    queryKey: ['reports', 'summary', range],
    queryFn: () => reportsApi.summary(range),
  });
  const series = useQuery({
    queryKey: ['reports', 'timeseries', range],
    queryFn: () => reportsApi.timeseries(range),
  });
  const top = useQuery({
    queryKey: ['reports', 'top-products', range],
    queryFn: () => reportsApi.topProducts(10, range),
  });
  const recent = useQuery({
    queryKey: ['reports', 'recent-orders'],
    queryFn: () => reportsApi.recentOrders(RECENT_WINDOW),
  });
  const byBrand = useQuery({
    queryKey: ['reports', 'by-brand', range],
    queryFn: () => reportsApi.salesByBrand(range),
  });
  const byStore = useQuery({
    queryKey: ['reports', 'by-store', range],
    queryFn: () => reportsApi.salesByStore(range),
  });
  const byGov = useQuery({
    queryKey: ['reports', 'by-gov', range],
    queryFn: () => reportsApi.salesByGovernorate(range),
  });
  const charges = useQuery({
    queryKey: ['reports', 'charges', range],
    queryFn: () => reportsApi.charges(range),
  });
  const refundStats = useQuery({
    queryKey: ['reports', 'refund-stats', range],
    queryFn: () => reportsApi.refundStats(range),
  });

  const statusLabel = (s: OrderStatus) => t(`orders.status.${s.toLowerCase()}`);

  // Client-side pagination for the recent-orders widget.
  const [recentPage, setRecentPage] = useState(1);
  const [recentSize, setRecentSize] = useState(10);
  const recentRows = recent.data ?? [];
  const recentSlice = recentRows.slice((recentPage - 1) * recentSize, recentPage * recentSize);

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title={t('reports.title')} description={t('reports.subtitle')} />

      {/* Date range filter */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-sm font-medium">{t('reports.date_range')}</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((n) => (
              <Button
                key={n}
                size="sm"
                variant={activePreset === n ? 'default' : 'outline'}
                onClick={() => setPreset(n)}
              >
                {t('reports.last_n_days', { count: n })}
              </Button>
            ))}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Input
              type="date"
              value={start}
              max={end || todayISO()}
              onChange={(e) => setField('start', e.target.value)}
              className="h-8 w-auto"
              aria-label={t('reports.from')}
            />
            <span className="text-muted-foreground">→</span>
            <Input
              type="date"
              value={end}
              max={todayISO()}
              onChange={(e) => setField('end', e.target.value)}
              className="h-8 w-auto"
              aria-label={t('reports.to')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('reports.revenue')}
          value={summary.data ? formatMoney(summary.data.revenueCents) : '—'}
          loading={summary.isLoading}
        />
        <StatCard
          label={t('reports.orders')}
          value={summary.data ? String(summary.data.orderCount) : '—'}
          loading={summary.isLoading}
        />
        <StatCard
          label={t('reports.aov')}
          value={summary.data ? formatMoney(summary.data.aovCents) : '—'}
          loading={summary.isLoading}
        />
        <StatCard
          label={t('reports.active_customers')}
          value={summary.data ? String(summary.data.customerCount) : '—'}
          loading={summary.isLoading}
        />
      </div>

      {/* Orders + revenue per day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('reports.trend')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <OrdersTimeseriesChart data={series.data ?? []} loading={series.isLoading} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('reports.orders_by_status')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {summary.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : summary.data && summary.data.ordersByStatus.length > 0 ? (
              <ul className="space-y-2">
                {summary.data.ordersByStatus.map(({ status, count }) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <StatusBadge label={statusLabel(status)} tone={orderStatusTone(status)} />
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t('reports.no_orders')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('reports.top_products')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {top.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : top.data && top.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t('carts.product')}</TableHead>
                    <TableHead className="text-end">{t('reports.units_sold')}</TableHead>
                    <TableHead className="text-end">{t('reports.revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top.data.map((p) => (
                    <TableRow key={p.productId} className="hover:bg-transparent">
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{p.sku}</div>
                      </TableCell>
                      <TableCell className="text-end">{p.units}</TableCell>
                      <TableCell className="text-end font-medium">
                        {formatMoney(p.revenueCents, p.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">{t('reports.no_sales')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('reports.by_brand')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList
              loading={byBrand.isLoading}
              empty={t('reports.no_sales')}
              items={(byBrand.data ?? []).map((b) => ({ label: b.name, value: b.revenueCents }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('reports.by_store')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList
              loading={byStore.isLoading}
              empty={t('reports.no_sales')}
              items={(byStore.data ?? []).map((s) => ({ label: s.name, value: s.revenueCents }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('reports.by_governorate')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList
              loading={byGov.isLoading}
              empty={t('reports.no_sales')}
              items={(byGov.data ?? []).map((g) => ({
                label: g.governorate ? humanizeGeo(g.governorate) : t('reports.unknown_region'),
                value: g.revenueCents,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('reports.charges')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {charges.isLoading || !charges.data ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <dl className="space-y-1.5 text-sm">
                <ChargeRow label={t('orders.subtotal')} value={formatMoney(charges.data.subtotalCents)} />
                {charges.data.discountCents > 0 && (
                  <ChargeRow label={t('coupons.discount')} value={`−${formatMoney(charges.data.discountCents)}`} />
                )}
                <ChargeRow label={t('orders.tax')} value={formatMoney(charges.data.taxCents)} />
                <ChargeRow label={t('orders.shipping')} value={formatMoney(charges.data.shippingCents)} />
                <ChargeRow label={t('orders.fees')} value={formatMoney(charges.data.feesCents)} />
                <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
                  <dt>{t('orders.total')}</dt>
                  <dd>{formatMoney(charges.data.totalCents)}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('reports.refunds')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {refundStats.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : refundStats.data && refundStats.data.byStatus.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {t('reports.refunds_completed')}:{' '}
                <span className="font-semibold text-foreground">
                  {formatMoney(refundStats.data.completedCents)}
                </span>
              </div>
              <ul className="space-y-2">
                {refundStats.data.byStatus.map((r) => (
                  <li key={r.status} className="flex items-center justify-between text-sm">
                    <StatusBadge
                      label={t(`refunds.status.${r.status.toLowerCase()}`)}
                      tone={refundStatusTone(r.status as Parameters<typeof refundStatusTone>[0])}
                    />
                    <span>
                      <span className="font-medium">{r.count}</span>
                      <span className="ms-2 text-muted-foreground">{formatMoney(r.amountCents)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('reports.no_refunds')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('reports.recent_orders')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {recent.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : recentRows.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t('orders.number')}</TableHead>
                    <TableHead>{t('orders.customer')}</TableHead>
                    <TableHead>{t('orders.total')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('orders.placed')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSlice.map((o) => (
                    <TableRow key={o.id} className="hover:bg-transparent">
                      <TableCell className="font-mono text-xs">
                        <Link to={`/orders/${o.id}`} className="hover:underline">
                          {o.number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{o.customer.name}</div>
                        <div className="text-xs text-muted-foreground">{o.customer.email}</div>
                      </TableCell>
                      <TableCell className="font-medium">{formatMoney(o.totalCents, o.currency)}</TableCell>
                      <TableCell>
                        <StatusBadge label={statusLabel(o.status)} tone={orderStatusTone(o.status)} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(o.placedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                page={recentPage}
                pageSize={recentSize}
                total={recentRows.length}
                onPageChange={setRecentPage}
                onPageSizeChange={(s) => {
                  setRecentSize(s);
                  setRecentPage(1);
                }}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t('reports.no_orders')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChargeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function BarList({
  items,
  loading,
  empty,
}: {
  items: { label: string; value: number }[];
  loading?: boolean;
  empty: string;
}) {
  if (loading) return <Skeleton className="h-32 w-full" />;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((i, idx) => (
        <li key={`${i.label}-${idx}`} className="text-sm">
          <div className="flex justify-between gap-2">
            <span className="truncate">{i.label}</span>
            <span className="font-medium">{formatMoney(i.value)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-2 text-2xl font-semibold">
          {loading ? <Skeleton className="h-7 w-20" /> : value}
        </div>
      </CardContent>
    </Card>
  );
}
