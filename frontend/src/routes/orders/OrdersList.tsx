import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Plus } from 'lucide-react';
import { ordersApi, orderStatusTone } from '@/features/orders/api';
import type { Order, OrderStatus } from '@/features/orders/types';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, formatMoney } from '@/lib/format';

const PAGE_SIZE = 20;
const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const ALL = '__all__';

export function OrdersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders', { search, status, page }],
    queryFn: () =>
      ordersApi.list({
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const statusLabel = (s: OrderStatus) => t(`orders.status.${s.toLowerCase()}`);

  const columns: Column<Order>[] = [
    {
      key: 'number',
      header: t('orders.number'),
      cell: (o) => <span className="font-mono text-xs">{o.number}</span>,
    },
    {
      key: 'customer',
      header: t('orders.customer'),
      cell: (o) => (
        <div>
          <div className="font-medium">{o.customer.name}</div>
          <div className="text-xs text-muted-foreground">{o.customer.email}</div>
        </div>
      ),
    },
    { key: 'items', header: t('orders.items'), cell: (o) => o.items.length },
    {
      key: 'total',
      header: t('orders.total'),
      cell: (o) => <span className="font-medium">{formatMoney(o.totalCents, o.currency)}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (o) => <StatusBadge label={statusLabel(o.status)} tone={orderStatusTone(o.status)} />,
    },
    {
      key: 'placed',
      header: t('orders.placed'),
      cell: (o) => <span className="text-muted-foreground">{formatDate(o.placedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardList}
        title={t('orders.title')}
        description={data ? t('orders.total_count', { count: data.total }) : undefined}
        action={
          <Button asChild>
            <Link to="/orders/new">
              <Plus className="h-4 w-4" />
              {t('orders.new')}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t('orders.search_placeholder')}
        />
        <Select
          value={status || ALL}
          onValueChange={(v) => {
            setStatus(v === ALL ? '' : (v as OrderStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('orders.all_statuses')}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(o) => o.id}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
        emptyState={
          <EmptyState
            icon={ClipboardList}
            title={t('orders.empty_title')}
            description={t('orders.empty_desc')}
          />
        }
      />

      {data && totalPages > 1 && (
        <Pagination page={data.page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
