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

const versionPattern = /^(\d+\.\d+\.\d+)?$/;
const urlPattern = /^(https?:\/\/\S{1,290})?$/;

const schema = z.object({
  businessName: z.string().max(120).optional().or(z.literal('')),
  businessEmail: z.string().email().optional().or(z.literal('')),
  businessPhone: z.string().max(40).optional().or(z.literal('')),
  businessAddress: z.string().max(300).optional().or(z.literal('')),
  defaultCurrency: z.string().length(3),
  minAppVersion: z.string().regex(versionPattern),
  latestAppVersion: z.string().regex(versionPattern),
  appStoreUrl: z.string().max(300),
  playStoreUrl: z.string().max(300),
  socialInstagram: z.string().regex(urlPattern),
  socialFacebook: z.string().regex(urlPattern),
  socialTiktok: z.string().regex(urlPattern),
  socialSnapchat: z.string().regex(urlPattern),
  socialYoutube: z.string().regex(urlPattern),
  socialX: z.string().regex(urlPattern),
  socialWhatsapp: z.string().max(40),
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
      minAppVersion: '',
      latestAppVersion: '',
      appStoreUrl: '',
      playStoreUrl: '',
      socialInstagram: '',
      socialFacebook: '',
      socialTiktok: '',
      socialSnapchat: '',
      socialYoutube: '',
      socialX: '',
      socialWhatsapp: '',
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
        minAppVersion: s.minAppVersion ?? '',
        latestAppVersion: s.latestAppVersion ?? '',
        appStoreUrl: s.appStoreUrl ?? '',
        playStoreUrl: s.playStoreUrl ?? '',
        socialInstagram: s.socialInstagram ?? '',
        socialFacebook: s.socialFacebook ?? '',
        socialTiktok: s.socialTiktok ?? '',
        socialSnapchat: s.socialSnapchat ?? '',
        socialYoutube: s.socialYoutube ?? '',
        socialX: s.socialX ?? '',
        socialWhatsapp: s.socialWhatsapp ?? '',
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
        // Always sent (empty = clear/disable), unlike the identity fields above.
        minAppVersion: values.minAppVersion.trim(),
        latestAppVersion: values.latestAppVersion.trim(),
        appStoreUrl: values.appStoreUrl.trim(),
        playStoreUrl: values.playStoreUrl.trim(),
        socialInstagram: values.socialInstagram.trim(),
        socialFacebook: values.socialFacebook.trim(),
        socialTiktok: values.socialTiktok.trim(),
        socialSnapchat: values.socialSnapchat.trim(),
        socialYoutube: values.socialYoutube.trim(),
        socialX: values.socialX.trim(),
        socialWhatsapp: values.socialWhatsapp.trim(),
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

              <h3 className="border-t pt-5 text-sm font-semibold">{t('settings.app_version_section')}</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label={t('settings.min_app_version')}
                  error={errors.minAppVersion ? t('settings.version_format_error') : undefined}
                  hint={t('settings.min_app_version_hint')}
                >
                  <Input dir="ltr" placeholder="1.0.0" autoComplete="off" {...register('minAppVersion')} />
                </FormField>
                <FormField
                  label={t('settings.latest_app_version')}
                  error={errors.latestAppVersion ? t('settings.version_format_error') : undefined}
                  hint={t('settings.latest_app_version_hint')}
                >
                  <Input dir="ltr" placeholder="1.1.0" autoComplete="off" {...register('latestAppVersion')} />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label={t('settings.play_store_url')} error={errors.playStoreUrl?.message}>
                  <Input dir="ltr" autoComplete="off" {...register('playStoreUrl')} />
                </FormField>
                <FormField label={t('settings.app_store_url')} error={errors.appStoreUrl?.message}>
                  <Input dir="ltr" autoComplete="off" {...register('appStoreUrl')} />
                </FormField>
              </div>

              <h3 className="border-t pt-5 text-sm font-semibold">{t('settings.social_section')}</h3>
              <p className="text-sm text-muted-foreground">{t('settings.social_section_hint')}</p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {(
                  [
                    ['socialInstagram', 'Instagram', 'https://instagram.com/yourpage'],
                    ['socialFacebook', 'Facebook', 'https://facebook.com/yourpage'],
                    ['socialTiktok', 'TikTok', 'https://tiktok.com/@yourpage'],
                    ['socialSnapchat', 'Snapchat', 'https://snapchat.com/add/yourpage'],
                    ['socialYoutube', 'YouTube', 'https://youtube.com/@yourchannel'],
                    ['socialX', 'X (Twitter)', 'https://x.com/yourpage'],
                  ] as const
                ).map(([name, label, placeholder]) => (
                  <FormField
                    key={name}
                    label={label}
                    error={errors[name] ? t('settings.social_url_error') : undefined}
                  >
                    <Input dir="ltr" placeholder={placeholder} autoComplete="off" {...register(name)} />
                  </FormField>
                ))}
                <FormField
                  label={t('settings.social_whatsapp')}
                  error={errors.socialWhatsapp?.message}
                  hint={t('settings.social_whatsapp_hint')}
                >
                  <Input dir="ltr" placeholder="9647701234567" autoComplete="off" {...register('socialWhatsapp')} />
                </FormField>
              </div>

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
