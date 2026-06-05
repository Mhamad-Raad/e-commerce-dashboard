import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { FeeGroup, FeeGroupWritePayload } from '@/features/feegroups/types';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fromMinor, toMinor } from '@/lib/format';

const CURRENCY = 'IQD';

const schema = z.object({
  name: z.string().min(1).max(60),
  label: z.string().min(1).max(40),
  fee: z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, { message: 'Invalid fee' }),
  taxRatePct: z
    .string()
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 100, {
      message: '0–100',
    }),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  feeGroup: FeeGroup | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: FeeGroupWritePayload) => void;
}

export function FeeGroupDialog({ open, feeGroup, saving, onOpenChange, onSubmit }: Props) {
  const { t } = useTranslation();
  const isEdit = !!feeGroup;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', label: '', fee: '0', taxRatePct: '0', isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: feeGroup?.name ?? '',
        label: feeGroup?.label ?? '',
        fee: feeGroup ? fromMinor(feeGroup.feeCents, CURRENCY).toString() : '0',
        taxRatePct: String(feeGroup?.taxRatePct ?? 0),
        isActive: feeGroup?.isActive ?? true,
      });
    }
  }, [open, feeGroup, reset]);

  const isActive = watch('isActive');

  const submit = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      label: values.label.trim(),
      feeCents: toMinor(Number(values.fee), CURRENCY),
      taxRatePct: Number(values.taxRatePct),
      isActive: values.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('fee_groups.edit') : t('fee_groups.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <FormField label={t('fee_groups.name')} error={errors.name?.message}>
            <Input autoComplete="off" placeholder={t('fee_groups.name_placeholder')} {...register('name')} />
          </FormField>
          <FormField
            label={t('fee_groups.label')}
            error={errors.label?.message}
            hint={t('fee_groups.label_hint')}
          >
            <Input autoComplete="off" placeholder={t('fee_groups.label_placeholder')} {...register('label')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={`${t('fee_groups.fee')} (${CURRENCY})`} error={errors.fee?.message}>
              <Input inputMode="decimal" {...register('fee')} />
            </FormField>
            <FormField
              label={t('fee_groups.tax_rate')}
              error={errors.taxRatePct?.message}
              hint={t('fee_groups.tax_rate_hint')}
            >
              <Input inputMode="numeric" {...register('taxRatePct')} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(c) => setValue('isActive', c === true)} />
            {t('common.active')}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
