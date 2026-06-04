import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, TicketPercent } from 'lucide-react';
import { toast } from 'sonner';
import { couponsApi } from '@/features/coupons/api';
import type { Coupon, CouponWritePayload } from '@/features/coupons/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { RowActions } from '@/components/RowActions';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useListParams } from '@/hooks/useListParams';
import { formatDate, formatMoney, extractErrorMessage } from '@/lib/format';
import { CouponDialog } from './CouponDialog';

const CURRENCY = 'IQD';

export function CouponsList() {
  const { t } = useTranslation();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({ key: 'coupons' });
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['coupons', { search, page, limit }],
    queryFn: () => couponsApi.list({ search: search || undefined, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['coupons'] });

  const saveMutation = useMutation({
    mutationFn: (payload: CouponWritePayload) =>
      editing ? couponsApi.update(editing.id, payload) : couponsApi.create(payload),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(t('coupons.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
      toast.success(t('coupons.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const valueLabel = (c: Coupon) =>
    c.type === 'PERCENT' ? `${c.value}%` : formatMoney(c.value, CURRENCY);

  const columns: Column<Coupon>[] = [
    { key: 'code', header: t('coupons.code'), cell: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { key: 'value', header: t('coupons.discount'), cell: valueLabel },
    {
      key: 'min',
      header: t('coupons.min_subtotal'),
      cell: (c) => (c.minSubtotalCents ? formatMoney(c.minSubtotalCents, CURRENCY) : '—'),
    },
    {
      key: 'redemptions',
      header: t('coupons.redemptions'),
      cell: (c) => `${c.redeemedCount}${c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}`,
    },
    {
      key: 'expires',
      header: t('coupons.expires_at'),
      cell: (c) =>
        c.expiresAt ? (
          formatDate(c.expiresAt)
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (c) => (
        <StatusBadge
          label={c.isActive ? t('common.active') : t('common.inactive')}
          tone={c.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (c) => <RowActions onEdit={() => openEdit(c)} onDelete={() => setToDelete(c)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={TicketPercent}
        title={t('coupons.title')}
        description={data ? t('coupons.total_count', { count: data.total }) : undefined}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t('coupons.new')}
          </Button>
        }
      />

      <UrlSearchInput value={search} onChange={setSearch} placeholder={t('coupons.search_placeholder')} />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(c) => c.id}
        onRowClick={(c) => openEdit(c)}
        emptyState={
          <EmptyState
            icon={TicketPercent}
            title={t('coupons.empty_title')}
            description={t('coupons.empty_desc')}
            action={
              <Button size="sm" onClick={openNew}>
                <Plus className="h-4 w-4" />
                {t('coupons.new')}
              </Button>
            }
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

      <CouponDialog
        open={dialogOpen}
        coupon={editing}
        saving={saveMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={t('coupons.delete_title')}
        message={toDelete ? t('coupons.delete_message', { code: toDelete.code }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
