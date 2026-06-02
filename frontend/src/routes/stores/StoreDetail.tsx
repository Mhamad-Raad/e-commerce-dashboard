import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Store as StoreIcon, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { storesApi } from '@/features/stores/api';
import type { StoreProduct } from '@/features/stores/types';
import { ProductImage } from '@/features/products/ProductImage';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable, type Column } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatMoney, extractErrorMessage } from '@/lib/format';

export function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: store, isLoading, isError, error } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.get(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => storesApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success(t('stores.deleted_toast'));
      navigate('/stores');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
      setConfirmOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/stores">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <p className="text-destructive">{extractErrorMessage(error)}</p>
      </div>
    );
  }

  const productColumns: Column<StoreProduct>[] = [
    {
      key: 'image',
      header: t('products.image'),
      className: 'w-14',
      cell: (p) => <ProductImage src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md" />,
    },
    {
      key: 'name',
      header: t('products.name'),
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'category',
      header: t('products.category'),
      cell: (p) => p.category?.name ?? t('common.none'),
    },
    { key: 'price', header: t('products.price'), cell: (p) => formatMoney(p.priceCents, p.currency) },
    { key: 'stock', header: t('products.stock'), cell: (p) => p.stock },
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
  ];

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/stores">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        icon={StoreIcon}
        title={store.name}
        description={[store.city, store.country].filter(Boolean).join(', ') || undefined}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/stores/${store.id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t('common.edit')}
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('stores.details')}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            <DetailRow label={t('stores.products_count')}>{store._count?.products ?? store.products.length}</DetailRow>
            <DetailRow label={t('stores.email')}>{store.email || t('common.none')}</DetailRow>
            <DetailRow label={t('stores.phone')}>{store.phone || t('common.none')}</DetailRow>
            <DetailRow label={t('stores.address')}>{store.address || t('common.none')}</DetailRow>
            <DetailRow label={t('common.status')}>
              <StatusBadge
                label={store.isActive ? t('common.active') : t('common.hidden')}
                tone={store.isActive ? 'green' : 'slate'}
              />
            </DetailRow>
            <DetailRow label={t('common.created')}>{formatDate(store.createdAt)}</DetailRow>
            {store.description && (
              <div className="py-2.5 text-sm">
                <div className="mb-1 text-muted-foreground">{t('stores.description')}</div>
                <p className="whitespace-pre-wrap">{store.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('stores.their_products')}</CardTitle>
          </CardHeader>
          <CardContent>
            {store.products.length === 0 ? (
              <EmptyState
                icon={Package}
                title={t('stores.no_products_title')}
                description={t('stores.no_products_desc')}
              />
            ) : (
              <DataTable
                columns={productColumns}
                rows={store.products}
                isLoading={false}
                rowKey={(p) => p.id}
                onRowClick={(p) => navigate(`/products/${p.id}`)}
                emptyState={null}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t('stores.delete_title')}
        message={t('stores.delete_message', { name: store.name })}
        busy={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
