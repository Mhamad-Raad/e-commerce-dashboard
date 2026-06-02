import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Tags, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { categoriesApi } from '@/features/categories/api';
import type { Category } from '@/features/categories/types';
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

export function CategoriesList() {
  const { t } = useTranslation();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({ key: 'categories' });
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories', { search, page, limit }],
    queryFn: () => categoriesApi.list({ search: search || undefined, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(t('categories.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const columns: Column<Category>[] = [
    {
      key: 'image',
      header: t('categories.image'),
      className: 'w-14',
      cell: (c) => <ProductImage src={c.imageUrl} alt={c.name} className="h-10 w-10 rounded-md" />,
    },
    {
      key: 'name',
      header: t('categories.name'),
      cell: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: 'slug',
      header: t('categories.slug'),
      cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span>,
    },
    {
      key: 'products',
      header: t('categories.products_count'),
      cell: (c) => c._count?.products ?? 0,
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (c) => (
        <StatusBadge
          label={c.isActive ? t('common.active') : t('common.hidden')}
          tone={c.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'created',
      header: t('common.created'),
      cell: (c) => <span className="text-muted-foreground">{formatDate(c.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (c) => <RowActions editTo={`/categories/${c.id}/edit`} onDelete={() => setToDelete(c)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Tags}
        title={t('categories.title')}
        description={data ? t('categories.total_count', { count: data.total }) : undefined}
        action={
          <Button asChild>
            <Link to="/categories/new">
              <Plus className="h-4 w-4" />
              {t('categories.new')}
            </Link>
          </Button>
        }
      />

      <UrlSearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('categories.search_placeholder')}
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(c) => c.id}
        emptyState={
          <EmptyState
            icon={Tags}
            title={t('categories.empty_title')}
            description={t('categories.empty_desc')}
            action={
              <Button asChild size="sm">
                <Link to="/categories/new">
                  <Plus className="h-4 w-4" />
                  {t('categories.new')}
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
        title={t('categories.delete_title')}
        message={toDelete ? t('categories.delete_message', { name: toDelete.name }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
