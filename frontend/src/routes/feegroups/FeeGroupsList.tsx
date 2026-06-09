import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { feeGroupsApi } from '@/features/feegroups/api';
import type { FeeGroup, FeeGroupWritePayload } from '@/features/feegroups/types';
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
import { formatMoney, extractErrorMessage } from '@/lib/format';
import { FeeGroupDialog } from './FeeGroupDialog';

const CURRENCY = 'IQD';

export function FeeGroupsList() {
  const { t } = useTranslation();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({ key: 'fee-groups' });
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeeGroup | null>(null);
  const [toDelete, setToDelete] = useState<FeeGroup | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['fee-groups', { search, page, limit }],
    queryFn: () => feeGroupsApi.list({ search: search || undefined, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['fee-groups'] });

  const saveMutation = useMutation({
    mutationFn: (payload: FeeGroupWritePayload) =>
      editing ? feeGroupsApi.update(editing.id, payload) : feeGroupsApi.create(payload),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(t('fee_groups.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => feeGroupsApi.remove(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
      toast.success(t('fee_groups.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (g: FeeGroup) => {
    setEditing(g);
    setDialogOpen(true);
  };

  const columns: Column<FeeGroup>[] = [
    { key: 'name', header: t('fee_groups.name'), cell: (g) => <span className="font-medium">{g.name}</span> },
    { key: 'label', header: t('fee_groups.label'), cell: (g) => g.label },
    { key: 'fee', header: t('fee_groups.fee'), cell: (g) => formatMoney(g.feeCents, CURRENCY) },
    {
      key: 'tax',
      header: t('fee_groups.tax_rate'),
      cell: (g) => (g.taxRatePct ? `${g.taxRatePct}%` : <span className="text-muted-foreground">—</span>),
    },
    {
      key: 'assigned',
      header: t('fee_groups.assigned'),
      cell: (g) =>
        t('fee_groups.assigned_count', {
          stores: g._count?.stores ?? 0,
        }),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (g) => (
        <StatusBadge
          label={g.isActive ? t('common.active') : t('common.inactive')}
          tone={g.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (g) => <RowActions onEdit={() => openEdit(g)} onDelete={() => setToDelete(g)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Receipt}
        title={t('fee_groups.title')}
        description={data ? t('fee_groups.total_count', { count: data.total }) : t('fee_groups.subtitle')}
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t('fee_groups.new')}
          </Button>
        }
      />

      <UrlSearchInput value={search} onChange={setSearch} placeholder={t('fee_groups.search_placeholder')} />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(g) => g.id}
        onRowClick={(g) => openEdit(g)}
        emptyState={
          <EmptyState
            icon={Receipt}
            title={t('fee_groups.empty_title')}
            description={t('fee_groups.empty_desc')}
            action={
              <Button size="sm" onClick={openNew}>
                <Plus className="h-4 w-4" />
                {t('fee_groups.new')}
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

      <FeeGroupDialog
        open={dialogOpen}
        feeGroup={editing}
        saving={saveMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!toDelete}
        title={t('fee_groups.delete_title')}
        message={toDelete ? t('fee_groups.delete_message', { name: toDelete.name }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
