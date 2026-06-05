import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { ProductVariant, VariantWritePayload } from '@/features/products/types';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fromMinor, toMinor } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1).max(120),
  sku: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/i),
  price: z.string().min(1).refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0),
  salePrice: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), { message: 'Invalid sale price' }),
  stock: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0),
  lowStockThreshold: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface VariantDialogProps {
  open: boolean;
  variant: ProductVariant | null;
  currency: string;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: VariantWritePayload) => void;
}

export function VariantDialog({
  open,
  variant,
  currency,
  saving,
  onOpenChange,
  onSubmit,
}: VariantDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!variant;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', sku: '', price: '', salePrice: '', stock: '0', lowStockThreshold: '5', imageUrl: '', sortOrder: '0', isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: variant?.name ?? '',
        sku: variant?.sku ?? '',
        price: variant ? fromMinor(variant.priceCents, currency).toString() : '',
        salePrice:
          variant?.salePriceCents != null ? fromMinor(variant.salePriceCents, currency).toString() : '',
        stock: String(variant?.stock ?? 0),
        lowStockThreshold: String(variant?.lowStockThreshold ?? 5),
        imageUrl: variant?.imageUrl ?? '',
        sortOrder: String(variant?.sortOrder ?? 0),
        isActive: variant?.isActive ?? true,
      });
    }
  }, [open, variant, currency, reset]);

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      priceCents: toMinor(Number(values.price), currency),
      salePriceCents: values.salePrice ? toMinor(Number(values.salePrice), currency) : null,
      stock: Number(values.stock),
      lowStockThreshold: Number(values.lowStockThreshold),
      imageUrl: values.imageUrl?.trim() || undefined,
      sortOrder: Number(values.sortOrder),
      isActive: values.isActive,
    });
  };

  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('variants.edit') : t('variants.new')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <FormField label={t('variants.name')} error={errors.name?.message}>
            <Input autoComplete="off" placeholder={t('variants.name_placeholder')} {...register('name')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('products.sku')} error={errors.sku?.message}>
              <Input className="font-mono" autoComplete="off" {...register('sku')} />
            </FormField>
            <FormField label={`${t('products.price')} (${currency})`} error={errors.price?.message}>
              <Input inputMode="decimal" {...register('price')} />
            </FormField>
            <FormField label={`${t('products.sale_price')} (${currency})`} error={errors.salePrice?.message}>
              <Input inputMode="decimal" placeholder={t('products.sale_price_placeholder')} {...register('salePrice')} />
            </FormField>
            <FormField label={t('products.stock')} error={errors.stock?.message}>
              <Input inputMode="numeric" {...register('stock')} />
            </FormField>
            <FormField label={t('products.low_stock_threshold')} error={errors.lowStockThreshold?.message}>
              <Input inputMode="numeric" {...register('lowStockThreshold')} />
            </FormField>
            <FormField label={t('variants.sort_order')} error={errors.sortOrder?.message}>
              <Input inputMode="numeric" {...register('sortOrder')} />
            </FormField>
          </div>
          <FormField label={t('products.image')} error={errors.imageUrl?.message}>
            <Input {...register('imageUrl')} placeholder="https://…" />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(c) => setValue('isActive', c === true)} />
            {t('common.active')}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
