import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Award, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { brandsApi } from '@/features/brands/api';
import type { Brand } from '@/features/brands/types';
import { ProductImage } from '@/features/products/ProductImage';
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
import { formatDate, extractErrorMessage } from '@/lib/format';

export function BrandsList() {
  const { t } = useTranslation();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({ key: 'brands' });
  const [toDelete, setToDelete] = useState<Brand | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['brands', { search, page, limit }],
    queryFn: () => brandsApi.list({ search: search || undefined, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(t('brands.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const columns: Column<Brand>[] = [
    {
      key: 'logo',
      header: t('brands.logo'),
      className: 'w-14',
      cell: (b) => <ProductImage src={b.logoUrl} alt={b.name} className="h-10 w-10 rounded-md" />,
    },
    {
      key: 'name',
      header: t('brands.name'),
      cell: (b) => <span className="font-medium">{b.name}</span>,
    },
    {
      key: 'slug',
      header: t('brands.slug'),
      cell: (b) => <span className="font-mono text-xs text-muted-foreground">{b.slug}</span>,
    },
    {
      key: 'products',
      header: t('brands.products_count'),
      cell: (b) => b._count?.products ?? 0,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (b) => (
        <StatusBadge
          label={b.isActive ? t('common.active') : t('common.hidden')}
          tone={b.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'created',
      header: t('common.created'),
      cell: (b) => <span className="text-muted-foreground">{formatDate(b.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (b) => <RowActions editTo={`/brands/${b.id}/edit`} onDelete={() => setToDelete(b)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Award}
        title={t('brands.title')}
        description={data ? t('brands.total_count', { count: data.total }) : undefined}
        action={
          <Button asChild>
            <Link to="/brands/new">
              <Plus className="h-4 w-4" />
              {t('brands.new')}
            </Link>
          </Button>
        }
      />

      <UrlSearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('brands.search_placeholder')}
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(b) => b.id}
        emptyState={
          <EmptyState
            icon={Award}
            title={t('brands.empty_title')}
            description={t('brands.empty_desc')}
            action={
              <Button asChild size="sm">
                <Link to="/brands/new">
                  <Plus className="h-4 w-4" />
                  {t('brands.new')}
                </Link>
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

      <ConfirmDialog
        open={!!toDelete}
        title={t('brands.delete_title')}
        message={toDelete ? t('brands.delete_message', { name: toDelete.name }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
