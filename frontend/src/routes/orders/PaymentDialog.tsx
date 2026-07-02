import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Payment, PaymentWritePayload } from '@/features/payments/types';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/features/payments/types';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

const schema = z.object({
  method: z.string().min(1),
  status: z.string().min(1),
  amount: z.string().min(1).refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0),
  reference: z.string().max(120).optional().or(z.literal('')),
  note: z.string().max(500).optional().or(z.literal('')),
  paidAt: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface PaymentDialogProps {
  open: boolean;
  payment: Payment | null;
  currency: string;
  defaultAmountCents: number;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: PaymentWritePayload) => void;
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export function PaymentDialog({
  open,
  payment,
  currency,
  defaultAmountCents,
  saving,
  onOpenChange,
  onSubmit,
}: PaymentDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!payment;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'COD', status: 'PENDING', amount: '', reference: '', note: '', paidAt: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        method: payment?.method ?? 'COD',
        status: payment?.status ?? 'PENDING',
        amount: fromMinor(payment?.amountCents ?? defaultAmountCents, currency).toString(),
        reference: payment?.reference ?? '',
        note: payment?.note ?? '',
        paidAt: toDateInput(payment?.paidAt ?? null),
      });
    }
  }, [open, payment, defaultAmountCents, currency, reset]);

  const method = watch('method');
  const status = watch('status');

  const submit = (values: FormValues) => {
    // The date input can't hold time-of-day, so only send paidAt when the user
    // actually changed the date — otherwise editing any other field would
    // rewrite a stored timestamp to UTC midnight and lose its time.
    const originalPaidAt = toDateInput(payment?.paidAt ?? null);
    const paidAtChanged = values.paidAt !== originalPaidAt;
    onSubmit({
      method: values.method as PaymentWritePayload['method'],
      status: values.status as PaymentWritePayload['status'],
      amountCents: toMinor(Number(values.amount), currency),
      reference: values.reference?.trim() || undefined,
      note: values.note?.trim() || undefined,
      paidAt:
        paidAtChanged && values.paidAt
          ? new Date(values.paidAt).toISOString()
          : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('payments.edit') : t('payments.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('payments.method')} error={errors.method?.message}>
              <Select value={method} onValueChange={(v) => setValue('method', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(`payments.methods.${m.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('payments.status')} error={errors.status?.message}>
              <Select value={status} onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`payments.statuses.${s.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={`${t('payments.amount')} (${currency})`} error={errors.amount?.message}>
              <Input inputMode="decimal" {...register('amount')} />
            </FormField>
            <FormField label={t('payments.paid_at')} error={errors.paidAt?.message}>
              <Input type="date" {...register('paidAt')} />
            </FormField>
          </div>
          <FormField label={t('payments.reference')} error={errors.reference?.message}>
            <Input autoComplete="off" placeholder={t('payments.reference_placeholder')} {...register('reference')} />
          </FormField>
          <FormField label={t('payments.note')} error={errors.note?.message}>
            <Textarea rows={2} {...register('note')} />
          </FormField>
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
