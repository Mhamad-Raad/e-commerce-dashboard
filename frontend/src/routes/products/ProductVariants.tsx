import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { variantsApi } from '@/features/products/api';
import type { Product, ProductVariant, VariantWritePayload } from '@/features/products/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { PriceLabel } from '@/components/PriceLabel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractErrorMessage } from '@/lib/format';
import { VariantDialog } from './VariantDialog';

export function ProductVariants({ product }: { product: Product }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const variants = product.variants ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [deleting, setDeleting] = useState<ProductVariant | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['product', product.id] });
    // The variant pickers in cart/new-order checkout read this key; without it
    // they serve stale prices or deleted variants for up to the staleTime.
    queryClient.invalidateQueries({ queryKey: ['product-variants', product.id] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: VariantWritePayload) =>
      editing
        ? variantsApi.update(product.id, editing.id, payload)
        : variantsApi.create(product.id, payload),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(t('variants.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (variant: ProductVariant) => variantsApi.remove(product.id, variant.id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success(t('variants.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (variant: ProductVariant) => {
    setEditing(variant);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          {t('variants.title')}
          {variants.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">({variants.length})</span>
          )}
        </CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          {t('variants.add')}
        </Button>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('variants.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-start text-xs uppercase text-muted-foreground">
                  <th className="py-2 text-start font-medium">{t('variants.name')}</th>
                  <th className="py-2 text-start font-medium">{t('products.sku')}</th>
                  <th className="py-2 text-end font-medium">{t('products.price')}</th>
                  <th className="py-2 text-end font-medium">{t('products.stock')}</th>
                  <th className="py-2 text-center font-medium">{t('common.status')}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{v.name}</td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">{v.sku}</td>
                    <td className="py-2.5 text-end">
                      <PriceLabel
                        priceCents={v.priceCents}
                        salePriceCents={v.salePriceCents}
                        currency={product.currency}
                      />
                    </td>
                    <td className="py-2.5 text-end">{v.stock}</td>
                    <td className="py-2.5 text-center">
                      <StatusBadge
                        label={v.isActive ? t('common.active') : t('common.hidden')}
                        tone={v.isActive ? 'green' : 'slate'}
                      />
                    </td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(v)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => setDeleting(v)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <VariantDialog
        open={dialogOpen}
        variant={editing}
        currency={product.currency}
        saving={saveMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        title={t('variants.delete_title')}
        message={t('variants.delete_message', { name: deleting?.name ?? '' })}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </Card>
  );
}
