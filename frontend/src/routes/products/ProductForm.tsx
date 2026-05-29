import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { productsApi } from '../../features/products/api';
import type { ProductWritePayload } from '../../features/products/types';
import { extractErrorMessage } from '../../lib/format';

const schema = z.object({
  name: z.string().min(1, 'Required').max(200),
  sku: z
    .string()
    .min(2, 'At least 2 characters')
    .max(40)
    .regex(/^[A-Z0-9_-]+$/i, 'Letters, digits, _ and - only'),
  price: z
    .string()
    .min(1, 'Required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Must be a non-negative number'),
  currency: z.string().length(3, 'Use a 3-letter code like USD'),
  stock: z
    .string()
    .min(1, 'Required')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Must be a whole number ≥ 0'),
  category: z.string().max(60).optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a URL').optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  sku: '',
  price: '',
  currency: 'USD',
  stock: '0',
  category: '',
  imageUrl: '',
  description: '',
  isActive: true,
};

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      reset({
        name: p.name,
        sku: p.sku,
        price: (p.priceCents / 100).toString(),
        currency: p.currency,
        stock: p.stock.toString(),
        category: p.category ?? '',
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
        priceCents: Math.round(Number(values.price) * 100),
        currency: values.currency.toUpperCase(),
        stock: Number(values.stock),
        category: values.category?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      };
      return isEdit ? productsApi.update(id!, payload) : productsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/products');
    },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    saveMutation.mutate(values);
  };

  if (isEdit && productQuery.isLoading) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }
  if (isEdit && productQuery.isError) {
    return (
      <div className="text-sm text-red-600">{extractErrorMessage(productQuery.error)}</div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? 'Edit product' : 'New product'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit ? 'Update product details.' : 'Add a product to the catalog.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        noValidate
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <input
              className={inputClass}
              autoComplete="off"
              {...register('name')}
            />
          </Field>
          <Field label="SKU" error={errors.sku?.message}>
            <input className={`${inputClass} font-mono`} autoComplete="off" {...register('sku')} />
          </Field>
          <Field label="Price" error={errors.price?.message}>
            <input className={inputClass} inputMode="decimal" {...register('price')} />
          </Field>
          <Field label="Currency" error={errors.currency?.message}>
            <input
              className={`${inputClass} uppercase`}
              maxLength={3}
              {...register('currency')}
            />
          </Field>
          <Field label="Stock" error={errors.stock?.message}>
            <input className={inputClass} inputMode="numeric" {...register('stock')} />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <input className={inputClass} autoComplete="off" {...register('category')} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Image URL" error={errors.imageUrl?.message}>
              <input className={inputClass} {...register('imageUrl')} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message}>
              <textarea rows={4} className={inputClass} {...register('description')} />
            </Field>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register('isActive')} className="rounded border-slate-300" />
          Active (visible to customers)
        </label>

        {serverError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isPending}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  'block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
