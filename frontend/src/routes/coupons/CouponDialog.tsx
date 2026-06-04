import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Coupon, CouponWritePayload, DiscountType } from '@/features/coupons/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fromMinor, toMinor } from '@/lib/format';

// Coupons are app-wide; amounts are in the store's default currency (IQD).
const CURRENCY = 'IQD';

const schema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/i),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.string().min(1).refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 1),
  minSubtotal: z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0),
  maxRedemptions: z.string().optional().or(z.literal('')),
  startsAt: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CouponDialogProps {
  open: boolean;
  coupon: Coupon | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CouponWritePayload) => void;
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export function CouponDialog({ open, coupon, saving, onOpenChange, onSubmit }: CouponDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!coupon;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '', type: 'PERCENT', value: '', minSubtotal: '0',
      maxRedemptions: '', startsAt: '', expiresAt: '', isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      const type = coupon?.type ?? 'PERCENT';
      reset({
        code: coupon?.code ?? '',
        type,
        value: coupon
          ? type === 'FIXED'
            ? fromMinor(coupon.value, CURRENCY).toString()
            : String(coupon.value)
          : '',
        minSubtotal: coupon ? fromMinor(coupon.minSubtotalCents, CURRENCY).toString() : '0',
        maxRedemptions: coupon?.maxRedemptions != null ? String(coupon.maxRedemptions) : '',
        startsAt: toDateInput(coupon?.startsAt ?? null),
        expiresAt: toDateInput(coupon?.expiresAt ?? null),
        isActive: coupon?.isActive ?? true,
      });
    }
  }, [open, coupon, reset]);

  const type = watch('type') as DiscountType;
  const isActive = watch('isActive');

  const submit = (values: FormValues) => {
    onSubmit({
      code: values.code.trim().toUpperCase(),
      type: values.type,
      value:
        values.type === 'FIXED'
          ? toMinor(Number(values.value), CURRENCY)
          : Math.round(Number(values.value)),
      minSubtotalCents: toMinor(Number(values.minSubtotal), CURRENCY),
      maxRedemptions: values.maxRedemptions ? Number(values.maxRedemptions) : null,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      isActive: values.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('coupons.edit') : t('coupons.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <FormField label={t('coupons.code')} error={errors.code?.message}>
            <Input className="font-mono uppercase" autoComplete="off" {...register('code')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('coupons.type')} error={errors.type?.message}>
              <Select value={type} onValueChange={(v) => setValue('type', v as DiscountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">{t('coupons.types.percent')}</SelectItem>
                  <SelectItem value="FIXED">{t('coupons.types.fixed')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              label={type === 'PERCENT' ? t('coupons.value_percent') : `${t('coupons.value_fixed')} (${CURRENCY})`}
              error={errors.value?.message}
            >
              <Input inputMode="decimal" {...register('value')} />
            </FormField>
            <FormField label={`${t('coupons.min_subtotal')} (${CURRENCY})`} error={errors.minSubtotal?.message}>
              <Input inputMode="decimal" {...register('minSubtotal')} />
            </FormField>
            <FormField
              label={t('coupons.max_redemptions')}
              error={errors.maxRedemptions?.message}
              hint={t('coupons.max_redemptions_hint')}
            >
              <Input inputMode="numeric" placeholder="∞" {...register('maxRedemptions')} />
            </FormField>
            <FormField label={t('coupons.starts_at')} error={errors.startsAt?.message}>
              <Input type="date" {...register('startsAt')} />
            </FormField>
            <FormField label={t('coupons.expires_at')} error={errors.expiresAt?.message}>
              <Input type="date" {...register('expiresAt')} />
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
