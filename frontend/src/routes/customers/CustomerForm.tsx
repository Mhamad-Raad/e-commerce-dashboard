import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { customersApi } from '../../features/customers/api';
import type { CustomerWritePayload } from '../../features/customers/types';
import { extractErrorMessage } from '../../lib/format';

const schema = z.object({
  name: z.string().min(1, 'Required').max(200),
  email: z.string().email('Enter a valid email'),
  phone: z.string().max(40).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  isActive: true,
};

export function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const customerQuery = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id!),
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
    if (customerQuery.data) {
      const c = customerQuery.data;
      reset({
        name: c.name,
        email: c.email,
        phone: c.phone ?? '',
        address: c.address ?? '',
        city: c.city ?? '',
        country: c.country ?? '',
        isActive: c.isActive,
      });
    }
  }, [customerQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: CustomerWritePayload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone?.trim() || undefined,
        address: values.address?.trim() || undefined,
        city: values.city?.trim() || undefined,
        country: values.country?.trim() || undefined,
        isActive: values.isActive,
      };
      return isEdit ? customersApi.update(id!, payload) : customersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/customers');
    },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    saveMutation.mutate(values);
  };

  if (isEdit && customerQuery.isLoading) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }
  if (isEdit && customerQuery.isError) {
    return (
      <div className="text-sm text-red-600">{extractErrorMessage(customerQuery.error)}</div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? 'Edit customer' : 'New customer'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit ? 'Update customer details.' : 'Add a customer to the directory.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        noValidate
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <input className={inputClass} autoComplete="name" {...register('name')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input className={inputClass} type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input className={inputClass} autoComplete="tel" {...register('phone')} />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input className={inputClass} {...register('city')} />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <input className={inputClass} {...register('country')} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address" error={errors.address?.message}>
              <textarea rows={3} className={inputClass} {...register('address')} />
            </Field>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register('isActive')} className="rounded border-slate-300" />
          Active
        </label>

        {serverError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isPending}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create customer'}
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
