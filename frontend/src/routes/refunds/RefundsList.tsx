import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ReceiptText } from 'lucide-react';
import { refundsApi } from '@/features/refunds/api';
import {
  REFUND_STATUSES,
  refundStatusTone,
  type Refund,
  type RefundStatus,
} from '@/features/refunds/types';
import { PageHeader } from '@/components/PageHeader';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
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

export function RefundsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { page, limit, search, getFilter, setPage, setLimit, setSearch, setFilter } = useListParams({
    key: 'refunds',
  });
  const status = getFilter('status') as RefundStatus | '';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['refunds', { search, status, page, limit }],
    queryFn: () =>
      refundsApi.list({
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize: limit,
      }),
    placeholderData: keepPreviousData,
  });

  const statusLabel = (s: RefundStatus) => t(`refunds.status.${s.toLowerCase()}`);
  const reasonLabel = (r: Refund['reason']) => t(`refunds.reasons.${r.toLowerCase()}`);

  const columns: Column<Refund>[] = [
    { key: 'number', header: t('refunds.number'), cell: (r) => <span className="font-mono text-xs">{r.number}</span> },
    { key: 'order', header: t('refunds.order'), cell: (r) => <span className="font-mono text-xs">{r.order.number}</span> },
    {
      key: 'customer',
      header: t('orders.customer'),
      cell: (r) => <span className="font-medium">{r.order.customer.name}</span>,
    },
    { key: 'reason', header: t('refunds.reason'), cell: (r) => reasonLabel(r.reason) },
    {
      key: 'amount',
      header: t('refunds.amount'),
      cell: (r) => <span className="font-medium">{formatMoney(r.amountCents, r.currency)}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (r) => <StatusBadge label={statusLabel(r.status)} tone={refundStatusTone(r.status)} />,
    },
    { key: 'created', header: t('common.created'), cell: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ReceiptText}
        title={t('refunds.title')}
        description={data ? t('refunds.total_count', { count: data.total }) : t('refunds.subtitle')}
      />

      <div className="flex flex-wrap items-center gap-3">
        <UrlSearchInput value={search} onChange={setSearch} placeholder={t('refunds.search_placeholder')} />
        <Select value={status || ALL} onValueChange={(v) => setFilter('status', v === ALL ? '' : v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('refunds.all_statuses')}</SelectItem>
            {REFUND_STATUSES.map((s) => (
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
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/refunds/${r.id}`)}
        emptyState={
          <EmptyState
            icon={ReceiptText}
            title={t('refunds.empty_title')}
            description={t('refunds.empty_desc')}
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
