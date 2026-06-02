import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Store as StoreIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { storesApi } from '@/features/stores/api';
import type { Store } from '@/features/stores/types';
import { ProductImage } from '@/features/products/ProductImage';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import { RowActions } from '@/components/RowActions';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, extractErrorMessage } from '@/lib/format';

const PAGE_SIZE = 20;

export function StoresList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Store | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['stores', { search, page }],
    queryFn: () => storesApi.list({ search: search || undefined, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success(t('stores.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
      setToDelete(null);
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const columns: Column<Store>[] = [
    {
      key: 'logo',
      header: t('stores.logo'),
      className: 'w-14',
      cell: (s) => <ProductImage src={s.logoUrl} alt={s.name} className="h-10 w-10 rounded-md" />,
    },
    {
      key: 'name',
      header: t('stores.name'),
      cell: (s) => <span className="font-medium">{s.name}</span>,
    },
    {
      key: 'location',
      header: t('stores.location'),
      cell: (s) => (
        <span className="text-muted-foreground">
          {[s.city, s.country].filter(Boolean).join(', ') || t('common.none')}
        </span>
      ),
    },
    {
      key: 'products',
      header: t('stores.products_count'),
      cell: (s) => s._count?.products ?? 0,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (s) => (
        <StatusBadge
          label={s.isActive ? t('common.active') : t('common.hidden')}
          tone={s.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'created',
      header: t('common.created'),
      cell: (s) => <span className="text-muted-foreground">{formatDate(s.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (s) => <RowActions editTo={`/stores/${s.id}/edit`} onDelete={() => setToDelete(s)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={StoreIcon}
        title={t('stores.title')}
        description={data ? t('stores.total_count', { count: data.total }) : undefined}
        action={
          <Button asChild>
            <Link to="/stores/new">
              <Plus className="h-4 w-4" />
              {t('stores.new')}
            </Link>
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder={t('stores.search_placeholder')}
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(s) => s.id}
        onRowClick={(s) => navigate(`/stores/${s.id}`)}
        emptyState={
          <EmptyState
            icon={StoreIcon}
            title={t('stores.empty_title')}
            description={t('stores.empty_desc')}
            action={
              <Button asChild size="sm">
                <Link to="/stores/new">
                  <Plus className="h-4 w-4" />
                  {t('stores.new')}
                </Link>
              </Button>
            }
          />
        }
      />

      {data && totalPages > 1 && (
        <Pagination page={data.page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t('stores.delete_title')}
        message={toDelete ? t('stores.delete_message', { name: toDelete.name }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
