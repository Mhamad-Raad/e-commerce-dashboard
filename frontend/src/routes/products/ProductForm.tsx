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
import { settingsApi } from '@/features/settings/api';
import { PageHeader } from '@/components/PageHeader';
import { TranslatableInput } from '@/components/TranslatableInput';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { AsyncCombobox } from '@/components/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AttributeFields } from '@/components/AttributeFields';
import { extractErrorMessage, fromMinor, toMinor } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional().or(z.literal('')),
  nameCkb: z.string().max(200).optional().or(z.literal('')),
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
  lowStockThreshold: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), {
      message: 'Invalid threshold',
    }),
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
  minLeadDays: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 365), {
      message: 'Enter 0–365 days',
    }),
  maxLeadDays: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 365), {
      message: 'Enter 0–365 days',
    }),
  storeId: z.string().min(1),
  categoryId: z.string().optional().or(z.literal('')),
  imageUrl: z.string().min(1, { message: 'Cover image is required' }).url(),
  images: z.array(z.string().url()),
  // Dynamic, category-driven values keyed by attribute key.
  attributes: z.record(z.any()),
  description: z.string().max(5000).optional().or(z.literal('')),
  descriptionAr: z.string().max(5000).optional().or(z.literal('')),
  descriptionCkb: z.string().max(5000).optional().or(z.literal('')),
  isActive: z.boolean(),
})
  // Delivery override is all-or-nothing: both blank (inherit) or both set.
  .refine((v) => (v.minLeadDays === '') === (v.maxLeadDays === ''), {
    message: 'Set both, or leave both blank to use the store default',
    path: ['maxLeadDays'],
  })
  .refine((v) => !v.minLeadDays || !v.maxLeadDays || Number(v.minLeadDays) <= Number(v.maxLeadDays), {
    message: 'Min must be ≤ max',
    path: ['maxLeadDays'],
  });

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  nameAr: '',
  nameCkb: '',
  sku: '',
  price: '',
  salePrice: '',
  currency: 'IQD',
  stock: '0',
  lowStockThreshold: '5',
  ratingAvg: '0',
  ratingCount: '0',
  minLeadDays: '',
  maxLeadDays: '',
  storeId: '',
  categoryId: '',
  imageUrl: '',
  images: [],
  attributes: {},
  description: '',
  descriptionAr: '',
  descriptionCkb: '',
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

  // New products default their currency to the store-wide setting.
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    enabled: !isEdit,
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
    if (!isEdit && settingsQuery.data) {
      setValue('currency', settingsQuery.data.defaultCurrency);
    }
  }, [isEdit, settingsQuery.data, setValue]);

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      reset({
        name: p.name,
        nameAr: p.nameAr ?? '',
        nameCkb: p.nameCkb ?? '',
        sku: p.sku,
        price: fromMinor(p.priceCents, p.currency).toString(),
        salePrice: p.salePriceCents != null ? fromMinor(p.salePriceCents, p.currency).toString() : '',
        currency: p.currency,
        stock: p.stock.toString(),
        lowStockThreshold: String(p.lowStockThreshold ?? 5),
        ratingAvg: String(p.ratingAvg ?? 0),
        ratingCount: String(p.ratingCount ?? 0),
        minLeadDays: p.minLeadDays != null ? String(p.minLeadDays) : '',
        maxLeadDays: p.maxLeadDays != null ? String(p.maxLeadDays) : '',
        storeId: p.storeId,
        categoryId: p.categoryId ?? '',
        imageUrl: p.imageUrl ?? '',
        images: p.images ?? [],
        attributes: p.attributes ?? {},
        description: p.description ?? '',
        descriptionAr: p.descriptionAr ?? '',
        descriptionCkb: p.descriptionCkb ?? '',
        isActive: p.isActive,
      });
    }
  }, [productQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      // Build attributes from the current category schema: drop empties, drop
      // keys not in the schema, and coerce number-typed values to numbers.
      const cleanedAttributes: Record<string, unknown> = {};
      for (const def of attrSchema) {
        const v = values.attributes?.[def.key];
        if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
        cleanedAttributes[def.key] =
          def.type === 'number' && !Number.isNaN(Number(v)) ? Number(v) : v;
      }

      const payload: ProductWritePayload = {
        name: values.name.trim(),
        nameAr: values.nameAr?.trim() || undefined,
        nameCkb: values.nameCkb?.trim() || undefined,
        sku: values.sku.trim(),
        priceCents: toMinor(Number(values.price), values.currency),
        salePriceCents: values.salePrice ? toMinor(Number(values.salePrice), values.currency) : null,
        currency: values.currency.toUpperCase(),
        stock: Number(values.stock),
        lowStockThreshold: values.lowStockThreshold !== '' ? Number(values.lowStockThreshold) : 5,
        ratingAvg: values.ratingAvg !== '' ? Number(values.ratingAvg) : 0,
        ratingCount: values.ratingCount !== '' ? Number(values.ratingCount) : 0,
        // Both blank -> send null to clear any override and inherit the store window.
        minLeadDays: values.minLeadDays !== '' ? Number(values.minLeadDays) : null,
        maxLeadDays: values.maxLeadDays !== '' ? Number(values.maxLeadDays) : null,
        storeId: values.storeId,
        categoryId: values.categoryId || undefined,
        imageUrl: values.imageUrl.trim(),
        images: values.images,
        attributes: cleanedAttributes,
        description: values.description?.trim() || undefined,
        descriptionAr: values.descriptionAr?.trim() || undefined,
        descriptionCkb: values.descriptionCkb?.trim() || undefined,
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

  const categoryId = watch('categoryId');

  // Load the selected category's attribute schema to drive the dynamic fields.
  const attrCategoryQuery = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoriesApi.get(categoryId!),
    enabled: !!categoryId,
  });
  const attrSchema = attrCategoryQuery.data?.attributeSchema ?? [];

  if (isEdit && productQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isEdit && productQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(productQuery.error)}</p>;
  }

  const isActive = watch('isActive');
  const storeId = watch('storeId');
  const attributes = (watch('attributes') ?? {}) as Record<string, unknown>;

  // Add/clear a single attribute value (reads fresh state to avoid stale closures).
  const setAttr = (key: string, val: unknown) => {
    const next = { ...((watch('attributes') ?? {}) as Record<string, unknown>) };
    if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
      delete next[key];
    } else {
      next[key] = val;
    }
    setValue('attributes', next, { shouldDirty: true });
  };

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
              <TranslatableInput
                label={t('products.name')}
                required
                value={{
                  en: watch('name') ?? '',
                  ar: watch('nameAr') ?? '',
                  ckb: watch('nameCkb') ?? '',
                }}
                onChange={(v) => {
                  setValue('name', v.en, { shouldDirty: true });
                  setValue('nameAr', v.ar, { shouldDirty: true });
                  setValue('nameCkb', v.ckb, { shouldDirty: true });
                }}
                error={errors.name?.message}
              />
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
                label={t('products.low_stock_threshold')}
                error={errors.lowStockThreshold?.message}
                hint={t('products.low_stock_threshold_hint')}
              >
                <Input inputMode="numeric" {...register('lowStockThreshold')} />
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
              <div className="md:col-span-2">
                <p className="text-sm font-medium">{t('products.lead_time')}</p>
                <p className="text-xs text-muted-foreground">
                  {productQuery.data?.store?.minLeadDays != null
                    ? t('products.lead_time_inherit_hint', {
                        min: productQuery.data.store.minLeadDays,
                        max: productQuery.data.store.maxLeadDays,
                      })
                    : t('products.lead_time_hint')}
                </p>
              </div>
              <FormField label={t('products.lead_min')} error={errors.minLeadDays?.message}>
                <Input
                  inputMode="numeric"
                  placeholder={t('products.lead_inherit_placeholder')}
                  {...register('minLeadDays')}
                />
              </FormField>
              <FormField label={t('products.lead_max')} error={errors.maxLeadDays?.message}>
                <Input
                  inputMode="numeric"
                  placeholder={t('products.lead_inherit_placeholder')}
                  {...register('maxLeadDays')}
                />
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
              <div className="md:col-span-2">
                <FormField
                  label={t('products.cover_image')}
                  error={errors.imageUrl?.message}
                  hint={t('products.cover_image_hint')}
                >
                  <ImageUpload
                    value={watch('imageUrl') ?? ''}
                    onChange={(url) => setValue('imageUrl', url, { shouldDirty: true })}
                    folder="products"
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label={t('products.gallery')} error={errors.images?.message}>
                  <MultiImageUpload
                    value={watch('images') ?? []}
                    onChange={(urls) => setValue('images', urls, { shouldDirty: true })}
                    folder="products"
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <TranslatableInput
                  label={t('products.description')}
                  multiline
                  value={{
                    en: watch('description') ?? '',
                    ar: watch('descriptionAr') ?? '',
                    ckb: watch('descriptionCkb') ?? '',
                  }}
                  onChange={(v) => {
                    setValue('description', v.en, { shouldDirty: true });
                    setValue('descriptionAr', v.ar, { shouldDirty: true });
                    setValue('descriptionCkb', v.ckb, { shouldDirty: true });
                  }}
                  error={errors.description?.message}
                />
              </div>

              {attrSchema.length > 0 && (
                <div className="space-y-4 md:col-span-2">
                  <p className="text-sm font-medium">{t('products.attributes')}</p>
                  <AttributeFields schema={attrSchema} values={attributes} onChange={setAttr} />
                </div>
              )}
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
