import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { productsApi } from '@/features/products/api';
import type { ProductWritePayload } from '@/features/products/types';
import { storesApi } from '@/features/stores/api';
import { categoriesApi } from '@/features/categories/api';
import { brandsApi } from '@/features/brands/api';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { AsyncCombobox } from '@/components/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage, fromMinor, toMinor } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/i),
  price: z.string().min(1).refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0),
  salePrice: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: 'Invalid sale price',
    }),
  currency: z.string().length(3),
  stock: z.string().min(1).refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0),
  ratingAvg: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 5), {
      message: 'Rating must be 0–5',
    }),
  ratingCount: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), {
      message: 'Invalid count',
    }),
  storeId: z.string().min(1),
  categoryId: z.string().optional().or(z.literal('')),
  brandId: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  sku: '',
  price: '',
  salePrice: '',
  currency: 'IQD',
  stock: '0',
  ratingAvg: '0',
  ratingCount: '0',
  storeId: '',
  categoryId: '',
  brandId: '',
  imageUrl: '',
  description: '',
  isActive: true,
};

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      reset({
        name: p.name,
        sku: p.sku,
        price: fromMinor(p.priceCents, p.currency).toString(),
        salePrice: p.salePriceCents != null ? fromMinor(p.salePriceCents, p.currency).toString() : '',
        currency: p.currency,
        stock: p.stock.toString(),
        ratingAvg: String(p.ratingAvg ?? 0),
        ratingCount: String(p.ratingCount ?? 0),
        storeId: p.storeId,
        categoryId: p.categoryId ?? '',
        brandId: p.brandId ?? '',
        imageUrl: p.imageUrl ?? '',
        description: p.description ?? '',
        isActive: p.isActive,
      });
    }
  }, [productQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: ProductWritePayload = {
        name: values.name.trim(),
        sku: values.sku.trim(),
        priceCents: toMinor(Number(values.price), values.currency),
        salePriceCents: values.salePrice ? toMinor(Number(values.salePrice), values.currency) : null,
        currency: values.currency.toUpperCase(),
        stock: Number(values.stock),
        ratingAvg: values.ratingAvg !== '' ? Number(values.ratingAvg) : 0,
        ratingCount: values.ratingCount !== '' ? Number(values.ratingCount) : 0,
        storeId: values.storeId,
        categoryId: values.categoryId || undefined,
        brandId: values.brandId || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      };
      return isEdit ? productsApi.update(id!, payload) : productsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success(t('products.saved_toast'));
      navigate('/products');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isEdit && productQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isEdit && productQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(productQuery.error)}</p>;
  }

  const isActive = watch('isActive');
  const storeId = watch('storeId');
  const categoryId = watch('categoryId');
  const brandId = watch('brandId');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/products">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={Package} title={isEdit ? t('common.edit') : t('products.new')} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label={t('products.name')} error={errors.name?.message}>
                <Input autoComplete="off" {...register('name')} />
              </FormField>
              <FormField label={t('products.sku')} error={errors.sku?.message}>
                <Input className="font-mono" autoComplete="off" {...register('sku')} />
              </FormField>
              <FormField label={t('products.price')} error={errors.price?.message}>
                <Input inputMode="decimal" {...register('price')} />
              </FormField>
              <FormField
                label={t('products.sale_price')}
                error={errors.salePrice?.message}
                hint={t('products.sale_price_hint')}
              >
                <Input inputMode="decimal" placeholder={t('products.sale_price_placeholder')} {...register('salePrice')} />
              </FormField>
              <FormField label={t('common.currency')} error={errors.currency?.message}>
                <Input className="uppercase" maxLength={3} {...register('currency')} />
              </FormField>
              <FormField label={t('products.stock')} error={errors.stock?.message}>
                <Input inputMode="numeric" {...register('stock')} />
              </FormField>
              <FormField
                label={t('products.rating')}
                error={errors.ratingAvg?.message}
                hint={t('products.rating_hint')}
              >
                <Input inputMode="decimal" {...register('ratingAvg')} />
              </FormField>
              <FormField label={t('products.rating_count')} error={errors.ratingCount?.message}>
                <Input inputMode="numeric" {...register('ratingCount')} />
              </FormField>
              <FormField label={t('products.store')} error={errors.storeId?.message}>
                <AsyncCombobox
                  value={storeId}
                  onChange={(v) => setValue('storeId', v, { shouldValidate: true })}
                  selectedLabel={productQuery.data?.store?.name}
                  placeholder={t('products.select_store')}
                  queryKey={['stores']}
                  fetchPage={(search, page) =>
                    storesApi
                      .list({ search: search || undefined, page, pageSize: 20 })
                      .then((r) => ({ items: r.items, total: r.total }))
                  }
                  getItemId={(s) => s.id}
                  getItemLabel={(s) => s.name}
                />
              </FormField>
              <FormField label={t('products.category')} error={errors.categoryId?.message}>
                <AsyncCombobox
                  value={categoryId ?? ''}
                  onChange={(v) => setValue('categoryId', v)}
                  selectedLabel={productQuery.data?.category?.name ?? undefined}
                  placeholder={t('products.select_category')}
                  allowClear
                  queryKey={['categories']}
                  fetchPage={(search, page) =>
                    categoriesApi
                      .list({ search: search || undefined, page, pageSize: 20 })
                      .then((r) => ({ items: r.items, total: r.total }))
                  }
                  getItemId={(c) => c.id}
                  getItemLabel={(c) => c.name}
                />
              </FormField>
              <FormField label={t('products.brand')} error={errors.brandId?.message}>
                <AsyncCombobox
                  value={brandId ?? ''}
                  onChange={(v) => setValue('brandId', v)}
                  selectedLabel={productQuery.data?.brand?.name ?? undefined}
                  placeholder={t('products.select_brand')}
                  allowClear
                  queryKey={['brands']}
                  fetchPage={(search, page) =>
                    brandsApi
                      .list({ search: search || undefined, page, pageSize: 20 })
                      .then((r) => ({ items: r.items, total: r.total }))
                  }
                  getItemId={(b) => b.id}
                  getItemLabel={(b) => b.name}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label={t('products.image')} error={errors.imageUrl?.message}>
                  <Input {...register('imageUrl')} placeholder="https://…" />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label={t('products.description')} error={errors.description?.message}>
                  <Textarea rows={4} {...register('description')} />
                </FormField>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isActive}
                onCheckedChange={(c) => setValue('isActive', c === true)}
              />
              {t('common.active')}
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
