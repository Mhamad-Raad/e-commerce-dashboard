import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { settingsApi, type SettingsWritePayload } from '@/features/settings/api';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';

const schema = z.object({
  businessName: z.string().max(120).optional().or(z.literal('')),
  businessEmail: z.string().email().optional().or(z.literal('')),
  businessPhone: z.string().max(40).optional().or(z.literal('')),
  businessAddress: z.string().max(300).optional().or(z.literal('')),
  defaultCurrency: z.string().length(3),
});

type FormValues = z.infer<typeof schema>;

export function Settings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: '',
      businessEmail: '',
      businessPhone: '',
      businessAddress: '',
      defaultCurrency: 'IQD',
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      const s = settingsQuery.data;
      reset({
        businessName: s.businessName ?? '',
        businessEmail: s.businessEmail ?? '',
        businessPhone: s.businessPhone ?? '',
        businessAddress: s.businessAddress ?? '',
        defaultCurrency: s.defaultCurrency,
      });
    }
  }, [settingsQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: SettingsWritePayload = {
        businessName: values.businessName?.trim() || undefined,
        businessEmail: values.businessEmail?.trim() || undefined,
        businessPhone: values.businessPhone?.trim() || undefined,
        businessAddress: values.businessAddress?.trim() || undefined,
        defaultCurrency: values.defaultCurrency.toUpperCase(),
      };
      return settingsApi.update(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(t('settings.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader icon={SettingsIcon} title={t('settings.title')} description={t('settings.subtitle')} />

      {settingsQuery.isLoading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : settingsQuery.isError ? (
        <p className="text-destructive">{extractErrorMessage(settingsQuery.error)}</p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
              <FormField label={t('settings.business_name')} error={errors.businessName?.message}>
                <Input autoComplete="off" {...register('businessName')} />
              </FormField>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label={t('settings.business_email')} error={errors.businessEmail?.message}>
                  <Input autoComplete="off" {...register('businessEmail')} />
                </FormField>
                <FormField label={t('settings.business_phone')} error={errors.businessPhone?.message}>
                  <Input autoComplete="off" {...register('businessPhone')} />
                </FormField>
              </div>
              <FormField label={t('settings.business_address')} error={errors.businessAddress?.message}>
                <Textarea rows={2} {...register('businessAddress')} />
              </FormField>
              <FormField
                label={t('settings.default_currency')}
                error={errors.defaultCurrency?.message}
                hint={t('settings.default_currency_hint')}
              >
                <Input className="max-w-[8rem] uppercase" maxLength={3} {...register('defaultCurrency')} />
              </FormField>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
