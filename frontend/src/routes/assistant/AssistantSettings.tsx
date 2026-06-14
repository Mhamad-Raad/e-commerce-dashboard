import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bot, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  assistantApi,
  ASSISTANT_MODELS,
  type AssistantConfigWritePayload,
} from '@/features/assistant/api';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/format';

// Optional non-negative integer entered as text; '' means "no limit".
const intOrBlank = z
  .string()
  .refine((v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0), {
    message: 'Enter a whole number ≥ 0, or leave blank for no limit',
  });
// Optional non-negative money (dollars) entered as text; '' means "no cap".
const moneyOrBlank = z
  .string()
  .refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
    message: 'Enter an amount ≥ 0, or leave blank for no cap',
  });

const schema = z.object({
  enabled: z.boolean(),
  model: z.string().min(1),
  maxMsgsPerMinute: intOrBlank,
  maxMsgsPerHour: intOrBlank,
  maxMsgsPerDay: intOrBlank,
  maxMsgsPerWeek: intOrBlank,
  maxMsgsPerMonth: intOrBlank,
  maxTokensPerDay: intOrBlank,
  maxTokensPerWeek: intOrBlank,
  maxTokensPerMonth: intOrBlank,
  budgetWeekly: moneyOrBlank,
  budgetMonthly: moneyOrBlank,
  budgetTotal: moneyOrBlank,
  warnThresholdPct: z
    .string()
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 100, {
      message: '1–100',
    }),
});

type FormValues = z.infer<typeof schema>;

const numStr = (n: number | null) => (n == null ? '' : String(n));
const centsToStr = (c: number | null) => (c == null ? '' : String(c / 100));
const toIntOrNull = (v: string) => (v === '' ? null : Number(v));
const toCentsOrNull = (v: string) => (v === '' ? null : Math.round(Number(v) * 100));

export function AssistantSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: ['assistant-config'],
    queryFn: () => assistantApi.getConfig(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      enabled: false,
      model: ASSISTANT_MODELS[0].value,
      maxMsgsPerMinute: '',
      maxMsgsPerHour: '',
      maxMsgsPerDay: '',
      maxMsgsPerWeek: '',
      maxMsgsPerMonth: '',
      maxTokensPerDay: '',
      maxTokensPerWeek: '',
      maxTokensPerMonth: '',
      budgetWeekly: '',
      budgetMonthly: '',
      budgetTotal: '',
      warnThresholdPct: '80',
    },
  });

  useEffect(() => {
    if (configQuery.data) {
      const c = configQuery.data;
      reset({
        enabled: c.enabled,
        model: c.model,
        maxMsgsPerMinute: numStr(c.maxMsgsPerMinute),
        maxMsgsPerHour: numStr(c.maxMsgsPerHour),
        maxMsgsPerDay: numStr(c.maxMsgsPerDay),
        maxMsgsPerWeek: numStr(c.maxMsgsPerWeek),
        maxMsgsPerMonth: numStr(c.maxMsgsPerMonth),
        maxTokensPerDay: numStr(c.maxTokensPerDay),
        maxTokensPerWeek: numStr(c.maxTokensPerWeek),
        maxTokensPerMonth: numStr(c.maxTokensPerMonth),
        budgetWeekly: centsToStr(c.budgetWeeklyCents),
        budgetMonthly: centsToStr(c.budgetMonthlyCents),
        budgetTotal: centsToStr(c.budgetTotalCents),
        warnThresholdPct: String(c.warnThresholdPct),
      });
    }
  }, [configQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: AssistantConfigWritePayload = {
        enabled: values.enabled,
        model: values.model,
        maxMsgsPerMinute: toIntOrNull(values.maxMsgsPerMinute),
        maxMsgsPerHour: toIntOrNull(values.maxMsgsPerHour),
        maxMsgsPerDay: toIntOrNull(values.maxMsgsPerDay),
        maxMsgsPerWeek: toIntOrNull(values.maxMsgsPerWeek),
        maxMsgsPerMonth: toIntOrNull(values.maxMsgsPerMonth),
        maxTokensPerDay: toIntOrNull(values.maxTokensPerDay),
        maxTokensPerWeek: toIntOrNull(values.maxTokensPerWeek),
        maxTokensPerMonth: toIntOrNull(values.maxTokensPerMonth),
        budgetWeeklyCents: toCentsOrNull(values.budgetWeekly),
        budgetMonthlyCents: toCentsOrNull(values.budgetMonthly),
        budgetTotalCents: toCentsOrNull(values.budgetTotal),
        warnThresholdPct: Number(values.warnThresholdPct),
      };
      return assistantApi.updateConfig(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-config'] });
      toast.success(t('assistant.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  // Manual unlock after a budget cap trips. Kept separate from the form save so
  // it works regardless of unsaved edits, and an ordinary save never silently
  // unlocks (it doesn't send `locked`).
  const unlockMutation = useMutation({
    mutationFn: () => assistantApi.updateConfig({ locked: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-config'] });
      toast.success(t('assistant.unlocked_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const enabled = watch('enabled');
  const model = watch('model');
  const config = configQuery.data;

  // Render a numeric/money limit field — collapses ~11 near-identical blocks.
  const numField = (
    name: keyof FormValues,
    label: string,
    mode: 'numeric' | 'decimal',
    placeholder: string,
  ) => (
    <FormField label={label} error={(errors[name] as { message?: string } | undefined)?.message}>
      <Input inputMode={mode} placeholder={placeholder} {...register(name)} />
    </FormField>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader icon={Bot} title={t('assistant.title')} description={t('assistant.subtitle')} />

      {configQuery.isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : configQuery.isError ? (
        <p className="text-destructive">{extractErrorMessage(configQuery.error)}</p>
      ) : (
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
          {config?.locked && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{t('assistant.locked_title')}</p>
                <p>{config.lockedReason || t('assistant.locked_generic')}</p>
                <p className="mt-1 text-xs">{t('assistant.locked_hint')}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={unlockMutation.isPending}
                onClick={() => unlockMutation.mutate()}
              >
                {t('assistant.unlock')}
              </Button>
            </div>
          )}

          {/* Master switch + model */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={enabled}
                  onCheckedChange={(c) => setValue('enabled', c === true, { shouldDirty: true })}
                />
                <span>
                  <span className="font-medium">{t('assistant.enabled')}</span>
                  <span className="block text-xs text-muted-foreground">{t('assistant.enabled_hint')}</span>
                </span>
              </label>

              <FormField label={t('assistant.model')} error={errors.model?.message} hint={t('assistant.model_hint')}>
                <Select value={model} onValueChange={(v) => setValue('model', v, { shouldDirty: true })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSISTANT_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          {/* Per-user limits */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assistant.per_user_limits')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <p className="text-xs text-muted-foreground">{t('assistant.limits_hint')}</p>
              <div>
                <p className="mb-2 text-sm font-medium">{t('assistant.message_limits')}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {numField('maxMsgsPerMinute', t('assistant.per_minute'), 'numeric', '∞')}
                  {numField('maxMsgsPerHour', t('assistant.per_hour'), 'numeric', '∞')}
                  {numField('maxMsgsPerDay', t('assistant.per_day'), 'numeric', '∞')}
                  {numField('maxMsgsPerWeek', t('assistant.per_week'), 'numeric', '∞')}
                  {numField('maxMsgsPerMonth', t('assistant.per_month'), 'numeric', '∞')}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">{t('assistant.token_limits')}</p>
                <div className="grid grid-cols-3 gap-3">
                  {numField('maxTokensPerDay', t('assistant.per_day'), 'numeric', '∞')}
                  {numField('maxTokensPerWeek', t('assistant.per_week'), 'numeric', '∞')}
                  {numField('maxTokensPerMonth', t('assistant.per_month'), 'numeric', '∞')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global budget caps */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assistant.budget_caps')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <p className="text-xs text-muted-foreground">{t('assistant.budget_hint')}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {numField('budgetWeekly', t('assistant.budget_weekly'), 'decimal', '$ ∞')}
                {numField('budgetMonthly', t('assistant.budget_monthly'), 'decimal', '$ ∞')}
                {numField('budgetTotal', t('assistant.budget_total'), 'decimal', '$ ∞')}
              </div>
              <FormField
                label={t('assistant.warn_threshold')}
                error={errors.warnThresholdPct?.message}
                hint={t('assistant.warn_threshold_hint')}
              >
                <Input className="max-w-[8rem]" inputMode="numeric" {...register('warnThresholdPct')} />
              </FormField>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
