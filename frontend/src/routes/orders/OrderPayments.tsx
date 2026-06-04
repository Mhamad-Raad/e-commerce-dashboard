import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { paymentsApi } from '@/features/payments/api';
import type { Payment, PaymentStatus, PaymentWritePayload } from '@/features/payments/types';
import type { Order } from '@/features/orders/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractErrorMessage, formatDate, formatMoney } from '@/lib/format';
import { PaymentDialog } from './PaymentDialog';

const statusTone: Record<PaymentStatus, 'green' | 'amber' | 'red' | 'slate'> = {
  PAID: 'green',
  PENDING: 'amber',
  FAILED: 'red',
  REFUNDED: 'slate',
};

export function OrderPayments({ order }: { order: Order }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const payments = order.payments ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState<Payment | null>(null);

  const paidCents = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amountCents, 0);
  const owedCents = Math.max(0, order.totalCents - paidCents);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['order', order.id] });

  const saveMutation = useMutation({
    mutationFn: (payload: PaymentWritePayload) =>
      editing
        ? paymentsApi.update(order.id, editing.id, payload)
        : paymentsApi.create(order.id, payload),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(t('payments.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (payment: Payment) => paymentsApi.remove(order.id, payment.id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success(t('payments.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (payment: Payment) => {
    setEditing(payment);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          {t('payments.title')}
        </CardTitle>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          {t('payments.add')}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">{t('payments.paid')}</div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatMoney(paidCents, order.currency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t('payments.owed')}</div>
            <div className={owedCents > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-semibold'}>
              {formatMoney(owedCents, order.currency)}
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t('payments.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-muted-foreground">
                  <th className="py-2 text-start font-medium">{t('payments.method')}</th>
                  <th className="py-2 text-end font-medium">{t('payments.amount')}</th>
                  <th className="py-2 text-center font-medium">{t('payments.status')}</th>
                  <th className="py-2 text-start font-medium">{t('payments.paid_at')}</th>
                  <th className="py-2 text-start font-medium">{t('payments.reference')}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2.5">{t(`payments.methods.${p.method.toLowerCase()}`)}</td>
                    <td className="py-2.5 text-end">{formatMoney(p.amountCents, order.currency)}</td>
                    <td className="py-2.5 text-center">
                      <StatusBadge label={t(`payments.statuses.${p.status.toLowerCase()}`)} tone={statusTone[p.status]} />
                    </td>
                    <td className="py-2.5 text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : '—'}</td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">{p.reference || '—'}</td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleting(p)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <PaymentDialog
        open={dialogOpen}
        payment={editing}
        currency={order.currency}
        defaultAmountCents={owedCents || order.totalCents}
        saving={saveMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        title={t('payments.delete_title')}
        message={t('payments.delete_message')}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </Card>
  );
}
