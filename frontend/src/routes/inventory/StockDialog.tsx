import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { inventoryApi } from '@/features/inventory/api';
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
import { extractErrorMessage } from '@/lib/format';

export interface StockTarget {
  productId: string;
  variantId?: string | null;
  label: string;
  stock: number;
}

type Mode = 'RESTOCK' | 'ADJUST';

interface Props {
  open: boolean;
  target: StockTarget | null;
  onOpenChange: (open: boolean) => void;
}

export function StockDialog({ open, target, onOpenChange }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>('RESTOCK');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode('RESTOCK');
      setAmount('');
      setNote('');
      setError(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => {
      const n = Number(amount);
      const variantId = target?.variantId ?? undefined;
      if (mode === 'RESTOCK') {
        return inventoryApi.restock({ productId: target!.productId, variantId, quantity: n, note: note || undefined });
      }
      return inventoryApi.adjust({ productId: target!.productId, variantId, delta: n, note: note || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success(t('inventory.stock_updated_toast'));
      onOpenChange(false);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const submit = () => {
    const n = Number(amount);
    if (amount === '' || Number.isNaN(n) || !Number.isInteger(n)) {
      return setError(t('inventory.amount_invalid'));
    }
    if (mode === 'RESTOCK' && n < 1) return setError(t('inventory.amount_invalid'));
    if (mode === 'ADJUST' && n === 0) return setError(t('inventory.amount_invalid'));
    if (mode === 'ADJUST' && target && target.stock + n < 0) {
      return setError(t('inventory.adjust_below_zero'));
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.update_stock')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {target?.label} — {t('inventory.current_stock')}: <span className="font-medium text-foreground">{target?.stock ?? 0}</span>
          </p>
          <FormField label={t('inventory.action')}>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESTOCK">{t('inventory.action_restock')}</SelectItem>
                <SelectItem value="ADJUST">{t('inventory.action_adjust')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label={mode === 'RESTOCK' ? t('inventory.quantity_to_add') : t('inventory.delta')}
            hint={mode === 'ADJUST' ? t('inventory.delta_hint') : undefined}
            error={error ?? undefined}
          >
            <Input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === 'ADJUST' ? 'e.g. -2' : 'e.g. 50'}
            />
          </FormField>
          <FormField label={t('inventory.note')}>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={submit} disabled={mutation.isPending}>
            {mutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
