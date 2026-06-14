import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { customersApi } from '@/features/customers/api';
import type { CustomerWritePayload } from '@/features/customers/types';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
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
  avatarUrl: '',
  isActive: true,
};

export function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const customerQuery = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id!),
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
    if (customerQuery.data) {
      const c = customerQuery.data;
      reset({
        name: c.name,
        email: c.email,
        phone: c.phone ?? '',
        address: c.address ?? '',
        city: c.city ?? '',
        country: c.country ?? '',
        avatarUrl: c.avatarUrl ?? '',
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
        avatarUrl: values.avatarUrl?.trim() || null,
        isActive: values.isActive,
      };
      return isEdit ? customersApi.update(id!, payload) : customersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success(t('customers.saved_toast'));
      navigate('/customers');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isEdit && customerQuery.isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }
  if (isEdit && customerQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(customerQuery.error)}</p>;
  }

  const isActive = watch('isActive');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/customers">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={Users} title={isEdit ? t('common.edit') : t('customers.new')} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
            <FormField label={t('customers.avatar')} error={errors.avatarUrl?.message}>
              <ImageUpload
                value={watch('avatarUrl') ?? ''}
                onChange={(url) => setValue('avatarUrl', url, { shouldDirty: true })}
                folder="customers"
              />
            </FormField>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label={t('customers.name')} error={errors.name?.message}>
                <Input autoComplete="name" {...register('name')} />
              </FormField>
              <FormField label={t('customers.email')} error={errors.email?.message}>
                <Input type="email" autoComplete="email" {...register('email')} />
              </FormField>
              <FormField label={t('customers.phone')} error={errors.phone?.message}>
                <Input autoComplete="tel" {...register('phone')} />
              </FormField>
              <FormField label={t('customers.city')} error={errors.city?.message}>
                <Input {...register('city')} />
              </FormField>
              <FormField label={t('customers.country')} error={errors.country?.message}>
                <Input {...register('country')} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label={t('customers.address')} error={errors.address?.message}>
                  <Textarea rows={3} {...register('address')} />
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
              <Button type="button" variant="outline" onClick={() => navigate('/customers')}>
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
