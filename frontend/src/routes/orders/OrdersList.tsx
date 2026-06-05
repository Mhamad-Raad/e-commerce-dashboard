import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Plus, Printer } from 'lucide-react';
import { ordersApi, orderStatusTone } from '@/features/orders/api';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@/features/orders/types';
import { PageHeader } from '@/components/PageHeader';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListParams } from '@/hooks/useListParams';
import { formatDate, formatMoney } from '@/lib/format';

const ALL = '__all__';

export function OrdersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { page, limit, search, getFilter, setPage, setLimit, setSearch, setFilter } = useListParams({
    key: 'orders',
  });
  const status = getFilter('status') as OrderStatus | '';
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders', { search, status, page, limit }],
    queryFn: () =>
      ordersApi.list({
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize: limit,
      }),
    placeholderData: keepPreviousData,
  });

  const statusLabel = (s: OrderStatus) => t(`orders.status.${s.toLowerCase()}`);

  const pageIds = data?.items.map((o) => o.id) ?? [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])],
    );

  const columns: Column<Order>[] = [
    {
      key: 'select',
      className: 'w-10',
      header: (
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
        </span>
      ),
      cell: (o) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selected.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
        </span>
      ),
    },
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
          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <Button asChild variant="outline">
                <Link to={`/receipts?ids=${selected.join(',')}`} target="_blank" rel="noopener">
                  <Printer className="h-4 w-4" />
                  {t('receipt.print_n', { count: selected.length })}
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/orders/new">
                <Plus className="h-4 w-4" />
                {t('orders.new')}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <UrlSearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('orders.search_placeholder')}
        />
        <Select
          value={status || ALL}
          onValueChange={(v) => setFilter('status', v === ALL ? '' : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('orders.all_statuses')}</SelectItem>
            {ORDER_STATUSES.map((s) => (
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

      {data && data.total > 0 && (
        <TablePagination
          page={page}
          pageSize={limit}
          total={data.total}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      )}
    </div>
  );
}
