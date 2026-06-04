import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi } from '@/features/products/api';
import { ProductImage } from '@/features/products/ProductImage';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { PriceLabel } from '@/components/PriceLabel';
import { ProductVariants } from './ProductVariants';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, extractErrorMessage } from '@/lib/format';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('products.deleted_toast'));
      navigate('/products');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="aspect-square w-full rounded-xl lg:col-span-1" />
          <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <p className="text-destructive">{extractErrorMessage(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/products">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        icon={Package}
        title={product.name}
        description={<span className="font-mono text-xs">{product.sku}</span>}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/products/${product.id}/edit`}>
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
          <CardContent className="p-4">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="aspect-square w-full rounded-lg"
              iconClassName="h-10 w-10"
            />
            {/* Gallery-ready: thumbnail strip. Multi-image upload slots in here later. */}
            <div className="mt-3 flex gap-2">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 rounded-md ring-2 ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('products.details')}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            <DetailRow label={t('products.price')}>
              <PriceLabel
                priceCents={product.priceCents}
                salePriceCents={product.salePriceCents}
                currency={product.currency}
              />
            </DetailRow>
            <DetailRow label={t('products.stock')}>{product.stock}</DetailRow>
            <DetailRow label={t('products.store')}>
              {product.store ? (
                <Link to={`/stores/${product.store.id}`} className="text-primary hover:underline">
                  {product.store.name}
                </Link>
              ) : (
                t('common.none')
              )}
            </DetailRow>
            <DetailRow label={t('products.category')}>
              {product.category?.name || t('common.none')}
            </DetailRow>
            <DetailRow label={t('common.status')}>
              <StatusBadge
                label={product.isActive ? t('common.active') : t('common.hidden')}
                tone={product.isActive ? 'green' : 'slate'}
              />
            </DetailRow>
            <DetailRow label={t('common.currency')}>{product.currency}</DetailRow>
            <DetailRow label={t('common.created')}>{formatDate(product.createdAt)}</DetailRow>
            <DetailRow label={t('common.updated')}>{formatDate(product.updatedAt)}</DetailRow>
            {product.description && (
              <div className="py-2.5 text-sm">
                <div className="mb-1 text-muted-foreground">{t('products.description')}</div>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductVariants product={product} />

      <ConfirmDialog
        open={confirmOpen}
        title={t('products.delete_title')}
        message={t('products.delete_message', { name: product.name })}
        busy={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
