import { Link, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, ShoppingCart } from 'lucide-react';
import { cartsApi, cartStatusTone } from '@/features/carts/api';
import { cartTotalCents, type Cart, type CartStatus } from '@/features/carts/types';
import { PageHeader } from '@/components/PageHeader';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
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
import { useListParams } from '@/hooks/useListParams';
import { formatDate, formatMoney } from '@/lib/format';

const STATUSES: CartStatus[] = ['OPEN', 'CHECKED_OUT', 'ABANDONED'];
const ALL = '__all__';

export function CartsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { page, limit, search, getFilter, setPage, setLimit, setSearch, setFilter } = useListParams({
    key: 'carts',
  });
  const status = getFilter('status') as CartStatus | '';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['carts', { search, status, page, limit }],
    queryFn: () =>
      cartsApi.list({
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize: limit,
      }),
    placeholderData: keepPreviousData,
  });

  const statusLabel = (s: CartStatus) => t(`carts.status.${s.toLowerCase()}`);

  const columns: Column<Cart>[] = [
    {
      key: 'customer',
      header: t('carts.customer'),
      cell: (c) => (
        <div>
          <div className="font-medium">{c.customer.name}</div>
          <div className="text-xs text-muted-foreground">{c.customer.email}</div>
        </div>
      ),
    },
    { key: 'items', header: t('carts.items'), cell: (c) => c.items.length },
    {
      key: 'total',
      header: t('carts.total'),
      cell: (c) => <span className="font-medium">{formatMoney(cartTotalCents(c))}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (c) => <StatusBadge label={statusLabel(c.status)} tone={cartStatusTone(c.status)} />,
    },
    {
      key: 'updated',
      header: t('carts.updated'),
      cell: (c) => <span className="text-muted-foreground">{formatDate(c.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ShoppingCart}
        title={t('carts.title')}
        description={data ? t('carts.total_count', { count: data.total }) : undefined}
        action={
          <Button asChild>
            <Link to="/carts/new">
              <Plus className="h-4 w-4" />
              {t('carts.new')}
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <UrlSearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('carts.search_placeholder')}
        />
        <Select
          value={status || ALL}
          onValueChange={(v) => setFilter('status', v === ALL ? '' : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('carts.all_statuses')}</SelectItem>
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
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(`/carts/${c.id}`)}
        emptyState={
          <EmptyState
            icon={ShoppingCart}
            title={t('carts.empty_title')}
            description={t('carts.empty_desc')}
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
