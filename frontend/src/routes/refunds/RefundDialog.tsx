import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { refundsApi } from '@/features/refunds/api';
import { REFUND_REASONS, type Refund, type RefundReason } from '@/features/refunds/types';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { formatMoney, extractErrorMessage } from '@/lib/format';

interface Props {
  open: boolean;
  orderId: string;
  onOpenChange: (open: boolean) => void;
  onCreated?: (refund: Refund) => void;
}

export function RefundDialog({ open, orderId, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<RefundReason>('DAMAGED');
  const [note, setNote] = useState('');
  const [restock, setRestock] = useState(true);

  const { data: refundable, isLoading } = useQuery({
    queryKey: ['refundable', orderId],
    queryFn: () => refundsApi.refundable(orderId),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setQty({});
      setReason('DAMAGED');
      setNote('');
      setRestock(true);
    }
  }, [open]);

  const currency = refundable?.currency ?? 'IQD';
  const eligible = (refundable?.items ?? []).filter((i) => i.refundableQuantity > 0);

  const amountCents = useMemo(
    () =>
      eligible.reduce((sum, i) => sum + (qty[i.orderItemId] ?? 0) * i.priceCents, 0),
    [eligible, qty],
  );

  const lines = eligible
    .filter((i) => (qty[i.orderItemId] ?? 0) > 0)
    .map((i) => ({ orderItemId: i.orderItemId, quantity: qty[i.orderItemId] }));

  const create = useMutation({
    mutationFn: () =>
      refundsApi.create({
        orderId,
        reason,
        note: note.trim() || undefined,
        restock,
        items: lines,
      }),
    onSuccess: (refund) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refundable', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success(t('refunds.created_toast'));
      onOpenChange(false);
      onCreated?.(refund);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const setItemQty = (orderItemId: string, value: number, max: number) =>
    setQty((prev) => ({ ...prev, [orderItemId]: Math.max(0, Math.min(max, value)) }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('refunds.new')}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="py-4 text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : eligible.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{t('refunds.nothing_refundable')}</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('refunds.select_items')}</p>
              <div className="rounded-lg border divide-y">
                {eligible.map((i) => (
                  <div key={i.orderItemId} className="flex items-center gap-3 p-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {i.name}
                        {i.variantName && <span className="text-muted-foreground"> · {i.variantName}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatMoney(i.priceCents, currency)} · {t('refunds.refundable_n', { count: i.refundableQuantity })}
                      </div>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={i.refundableQuantity}
                      value={qty[i.orderItemId] ?? 0}
                      onChange={(e) => setItemQty(i.orderItemId, Number(e.target.value), i.refundableQuantity)}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('refunds.reason')}>
                <Select value={reason} onValueChange={(v) => setReason(v as RefundReason)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`refunds.reasons.${r.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <div className="flex items-end">
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <Checkbox checked={restock} onCheckedChange={(c) => setRestock(c === true)} />
                  {t('refunds.restock')}
                </label>
              </div>
            </div>

            <FormField label={t('refunds.note')}>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>{t('refunds.amount')}</span>
              <span>{formatMoney(amountCents, currency)}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => create.mutate()}
            disabled={lines.length === 0 || create.isPending}
          >
            {create.isPending ? t('common.working') : t('refunds.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
