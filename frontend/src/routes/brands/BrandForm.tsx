import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Award } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { brandsApi } from '@/features/brands/api';
import type { BrandWritePayload } from '@/features/brands/types';
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
  name: z.string().min(1).max(60),
  logoUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  feeGroupId: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  logoUrl: '',
  description: '',
  feeGroupId: '',
  isActive: true,
};

export function BrandForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const brandQuery = useQuery({
    queryKey: ['brand', id],
    queryFn: () => brandsApi.get(id!),
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
    if (brandQuery.data) {
      const b = brandQuery.data;
      reset({
        name: b.name,
        logoUrl: b.logoUrl ?? '',
        description: b.description ?? '',
        feeGroupId: b.feeGroupId ?? '',
        isActive: b.isActive,
      });
    }
  }, [brandQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: BrandWritePayload = {
        name: values.name.trim(),
        logoUrl: values.logoUrl?.trim() || undefined,
        description: values.description?.trim() || undefined,
        feeGroupId: values.feeGroupId || null,
        isActive: values.isActive,
      };
      return isEdit ? brandsApi.update(id!, payload) : brandsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['brand', id] });
      toast.success(t('brands.saved_toast'));
      navigate('/brands');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isEdit && brandQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isEdit && brandQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(brandQuery.error)}</p>;
  }

  const isActive = watch('isActive');
  const feeGroupId = watch('feeGroupId');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/brands">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={Award} title={isEdit ? t('common.edit') : t('brands.new')} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
            <FormField label={t('brands.name')} error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label={t('brands.logo')} error={errors.logoUrl?.message}>
              <Input {...register('logoUrl')} placeholder="https://…" />
            </FormField>
            <FormField label={t('brands.description')} error={errors.description?.message}>
              <Textarea rows={3} {...register('description')} />
            </FormField>
            <FormField
              label={t('fee_groups.assign_label')}
              error={errors.feeGroupId?.message}
              hint={t('fee_groups.assign_hint')}
            >
              <AsyncCombobox
                value={feeGroupId ?? ''}
                onChange={(v) => setValue('feeGroupId', v)}
                selectedLabel={brandQuery.data?.feeGroup?.name ?? undefined}
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

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isActive}
                onCheckedChange={(c) => setValue('isActive', c === true)}
              />
              {t('common.active')}
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/brands')}>
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
