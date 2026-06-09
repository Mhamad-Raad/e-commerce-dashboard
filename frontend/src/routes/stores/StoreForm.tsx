import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Store as StoreIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { storesApi } from '@/features/stores/api';
import type { StoreWritePayload } from '@/features/stores/types';
import { feeGroupsApi } from '@/features/feegroups/api';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { AsyncCombobox } from '@/components/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  country: z.string().max(120).optional().or(z.literal('')),
  feeGroupId: z.string().optional().or(z.literal('')),
  minLeadDays: z
    .string()
    .min(1)
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 365, {
      message: 'Enter 0–365 days',
    }),
  maxLeadDays: z
    .string()
    .min(1)
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 365, {
      message: 'Enter 0–365 days',
    }),
  isActive: z.boolean(),
}).refine((v) => Number(v.minLeadDays) <= Number(v.maxLeadDays), {
  message: 'Min must be ≤ max',
  path: ['maxLeadDays'],
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  feeGroupId: '',
  minLeadDays: '3',
  maxLeadDays: '7',
  isActive: true,
};

export function StoreForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const storeQuery = useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.get(id!),
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
    if (storeQuery.data) {
      const s = storeQuery.data;
      reset({
        name: s.name,
        description: s.description ?? '',
        logoUrl: s.logoUrl ?? '',
        bannerUrl: s.bannerUrl ?? '',
        email: s.email ?? '',
        phone: s.phone ?? '',
        address: s.address ?? '',
        city: s.city ?? '',
        country: s.country ?? '',
        feeGroupId: s.feeGroupId ?? '',
        minLeadDays: String(s.minLeadDays ?? 3),
        maxLeadDays: String(s.maxLeadDays ?? 7),
        isActive: s.isActive,
      });
    }
  }, [storeQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const clean = (v?: string) => v?.trim() || undefined;
      const payload: StoreWritePayload = {
        name: values.name.trim(),
        description: clean(values.description),
        logoUrl: clean(values.logoUrl),
        bannerUrl: clean(values.bannerUrl),
        email: clean(values.email),
        phone: clean(values.phone),
        address: clean(values.address),
        city: clean(values.city),
        country: clean(values.country),
        feeGroupId: values.feeGroupId || null,
        minLeadDays: Number(values.minLeadDays),
        maxLeadDays: Number(values.maxLeadDays),
        isActive: values.isActive,
      };
      return isEdit ? storesApi.update(id!, payload) : storesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['store', id] });
      toast.success(t('stores.saved_toast'));
      navigate('/stores');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isEdit && storeQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isEdit && storeQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(storeQuery.error)}</p>;
  }

  const isActive = watch('isActive');
  const feeGroupId = watch('feeGroupId');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/stores">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={StoreIcon} title={isEdit ? t('common.edit') : t('stores.new')} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField label={t('stores.name')} error={errors.name?.message}>
                  <Input autoComplete="off" {...register('name')} />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label={t('stores.description')} error={errors.description?.message}>
                  <Textarea rows={3} {...register('description')} />
                </FormField>
              </div>
              <FormField label={t('stores.logo')} error={errors.logoUrl?.message}>
                <Input {...register('logoUrl')} placeholder="https://…" />
              </FormField>
              <FormField label={t('stores.banner')} error={errors.bannerUrl?.message}>
                <Input {...register('bannerUrl')} placeholder="https://…" />
              </FormField>
              <FormField label={t('stores.email')} error={errors.email?.message}>
                <Input autoComplete="off" {...register('email')} />
              </FormField>
              <FormField label={t('stores.phone')} error={errors.phone?.message}>
                <Input autoComplete="off" {...register('phone')} />
              </FormField>
              <div className="md:col-span-2">
                <FormField label={t('stores.address')} error={errors.address?.message}>
                  <Input autoComplete="off" {...register('address')} />
                </FormField>
              </div>
              <FormField label={t('stores.city')} error={errors.city?.message}>
                <Input autoComplete="off" {...register('city')} />
              </FormField>
              <FormField label={t('stores.country')} error={errors.country?.message}>
                <Input autoComplete="off" {...register('country')} />
              </FormField>
              <div className="md:col-span-2">
                <FormField
                  label={t('fee_groups.assign_label')}
                  error={errors.feeGroupId?.message}
                  hint={t('fee_groups.assign_hint')}
                >
                  <AsyncCombobox
                    value={feeGroupId ?? ''}
                    onChange={(v) => setValue('feeGroupId', v)}
                    selectedLabel={storeQuery.data?.feeGroup?.name ?? undefined}
                    placeholder={t('fee_groups.assign_placeholder')}
                    allowClear
                    queryKey={['fee-groups']}
                    fetchPage={(search, page) =>
                      feeGroupsApi
                        .list({ search: search || undefined, page, pageSize: 20 })
                        .then((r) => ({ items: r.items, total: r.total }))
                    }
                    getItemId={(g) => g.id}
                    getItemLabel={(g) => g.name}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">{t('stores.lead_time')}</p>
                <p className="text-xs text-muted-foreground">{t('stores.lead_time_hint')}</p>
              </div>
              <FormField label={t('stores.lead_min')} error={errors.minLeadDays?.message}>
                <Input inputMode="numeric" {...register('minLeadDays')} />
              </FormField>
              <FormField label={t('stores.lead_max')} error={errors.maxLeadDays?.message}>
                <Input inputMode="numeric" {...register('maxLeadDays')} />
              </FormField>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isActive}
                onCheckedChange={(c) => setValue('isActive', c === true)}
              />
              {t('common.active')}
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/stores')}>
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
