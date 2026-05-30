import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { reportsApi } from '@/features/reports/api';
import { orderStatusTone } from '@/features/orders/api';
import type { OrderStatus } from '@/features/orders/types';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
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

export function Reports() {
  const { t } = useTranslation();
  const summary = useQuery({ queryKey: ['reports', 'summary'], queryFn: reportsApi.summary });
  const top = useQuery({ queryKey: ['reports', 'top-products'], queryFn: () => reportsApi.topProducts(10) });
  const recent = useQuery({ queryKey: ['reports', 'recent-orders'], queryFn: () => reportsApi.recentOrders(10) });

  const statusLabel = (s: OrderStatus) => t(`orders.status.${s.toLowerCase()}`);

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title={t('reports.title')} description={t('reports.subtitle')} />

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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('reports.recent_orders')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recent.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : recent.data && recent.data.length > 0 ? (
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
                {recent.data.map((o) => (
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
          ) : (
            <p className="text-sm text-muted-foreground">{t('reports.no_orders')}</p>
          )}
        </CardContent>
      </Card>
    </div>
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
