import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { addressesApi } from '@/features/addresses/api';
import { PAYMENT_METHODS, type PaymentMethod } from '@/features/payments/types';
import type { CheckoutPayload } from '@/features/carts/api';
import type { Cart } from '@/features/carts/types';
import { cartTotalCents } from '@/features/carts/types';
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
import { formatMoney, toMinor } from '@/lib/format';
import { humanizeGeo } from '@/lib/iraqGeo';

const CURRENCY = 'IQD';

interface CheckoutDialogProps {
  open: boolean;
  cart: Cart;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CheckoutPayload) => void;
}

export function CheckoutDialog({ open, cart, saving, onOpenChange, onSubmit }: CheckoutDialogProps) {
  const { t } = useTranslation();
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [markPaid, setMarkPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [taxInput, setTaxInput] = useState('0');
  const [shippingInput, setShippingInput] = useState('0');

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses', cart.customerId],
    queryFn: () => addressesApi.list(cart.customerId),
    enabled: open,
  });

  // Default to the customer's default address once they load.
  useEffect(() => {
    if (open && addresses.length && !addressId) {
      setAddressId((addresses.find((a) => a.isDefault) ?? addresses[0]).id);
    }
  }, [open, addresses, addressId]);

  const taxCents = Math.max(0, toMinor(Number(taxInput) || 0, CURRENCY));
  const shippingCents = Math.max(0, toMinor(Number(shippingInput) || 0, CURRENCY));
  const total = cartTotalCents(cart) + taxCents + shippingCents;

  const submit = () => {
    if (!addressId) return;
    onSubmit({
      addressId,
      paymentMethod,
      markPaid,
      notes: notes.trim() || undefined,
      taxCents: taxCents || undefined,
      shippingCents: shippingCents || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('checkout.title')}</DialogTitle>
        </DialogHeader>

        {addresses.length === 0 ? (
          <div className="space-y-3 py-2 text-sm">
            <p className="text-muted-foreground">{t('checkout.no_address')}</p>
            <Button asChild variant="outline" size="sm">
              <Link to={`/customers/${cart.customerId}`}>{t('checkout.manage_addresses')}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label={t('orders.shipping_address')}>
              <Select value={addressId || undefined} onValueChange={setAddressId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('orders.select_address')} />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {(a.label ? `${a.label} — ` : '') +
                        `${humanizeGeo(a.city)}, ${humanizeGeo(a.governorate)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('payments.method')}>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
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
              <div className="flex items-end">
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <Checkbox checked={markPaid} onCheckedChange={(c) => setMarkPaid(c === true)} />
                  {t('checkout.mark_paid')}
                </label>
              </div>
              <FormField label={`${t('orders.tax')} (${CURRENCY})`}>
                <Input inputMode="decimal" value={taxInput} onChange={(e) => setTaxInput(e.target.value)} />
              </FormField>
              <FormField label={`${t('orders.shipping')} (${CURRENCY})`}>
                <Input
                  inputMode="decimal"
                  value={shippingInput}
                  onChange={(e) => setShippingInput(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label={t('checkout.notes')}>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </FormField>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>{t('orders.total')}</span>
              <span>{formatMoney(total, CURRENCY)}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={submit} disabled={!addressId || saving}>
            {saving ? t('common.working') : t('checkout.place_order')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
