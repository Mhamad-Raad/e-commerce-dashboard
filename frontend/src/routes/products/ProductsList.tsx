import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi } from '@/features/products/api';
import type { Product } from '@/features/products/types';
import { ProductImage } from '@/features/products/ProductImage';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { ExportCsvButton } from '@/components/ExportCsvButton';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { RowActions } from '@/components/RowActions';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceLabel } from '@/components/PriceLabel';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { useListParams } from '@/hooks/useListParams';
import { formatDate, extractErrorMessage } from '@/lib/format';

export function ProductsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({ key: 'products' });
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', { search, page, limit }],
    queryFn: () => productsApi.list({ search: search || undefined, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('products.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: t('products.image'),
      className: 'w-14',
      cell: (p) => (
        <ProductImage src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md" />
      ),
    },
    {
      key: 'name',
      header: t('products.name'),
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'sku',
      header: t('products.sku'),
      cell: (p) => <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>,
    },
    {
      key: 'store',
      header: t('products.store'),
      cell: (p) => p.store?.name ?? t('common.none'),
    },
    {
      key: 'category',
      header: t('products.category'),
      cell: (p) =>
        p.category?.name ? (
          p.category.name
        ) : (
          <span className="text-muted-foreground">{t('common.none')}</span>
        ),
    },
    {
      key: 'price',
      header: t('products.price'),
      cell: (p) => (
        <PriceLabel priceCents={p.priceCents} salePriceCents={p.salePriceCents} currency={p.currency} />
      ),
    },
    {
      key: 'variants',
      header: t('products.variants_count'),
      cell: (p) =>
        p._count?.variants ? (
          p._count.variants
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'stock', header: t('products.stock'), cell: (p) => p.stock },
    {
      key: 'rating',
      header: t('products.rating'),
      cell: (p) =>
        p.ratingCount > 0 ? (
          <Stars value={p.ratingAvg} count={p.ratingCount} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (p) => (
        <StatusBadge
          label={p.isActive ? t('common.active') : t('common.hidden')}
          tone={p.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'created',
      header: t('common.created'),
      cell: (p) => <span className="text-muted-foreground">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (p) => <RowActions editTo={`/products/${p.id}/edit`} onDelete={() => setToDelete(p)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Package}
        title={t('products.title')}
        description={data ? t('products.total_count', { count: data.total }) : undefined}
        action={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              path="/products/export"
              filename="products.csv"
              params={{ search: search || undefined }}
            />
            <Button asChild>
              <Link to="/products/new">
                <Plus className="h-4 w-4" />
                {t('products.new')}
              </Link>
            </Button>
          </div>
        }
      />

      <UrlSearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('products.search_placeholder')}
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(p) => p.id}
        onRowClick={(p) => navigate(`/products/${p.id}`)}
        emptyState={
          <EmptyState
            icon={Package}
            title={t('products.empty_title')}
            description={t('products.empty_desc')}
            action={
              <Button asChild size="sm">
                <Link to="/products/new">
                  <Plus className="h-4 w-4" />
                  {t('products.new')}
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
        title={t('products.delete_title')}
        message={toDelete ? t('products.delete_message', { name: toDelete.name }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
