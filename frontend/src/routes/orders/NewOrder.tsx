import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { customersApi } from '@/features/customers/api';
import { productsApi } from '@/features/products/api';
import type { Product } from '@/features/products/types';
import { ordersApi } from '@/features/orders/api';
import { PageHeader } from '@/components/PageHeader';
import { AsyncCombobox } from '@/components/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoney, extractErrorMessage } from '@/lib/format';

interface DraftItem {
  productId: string;
  name: string;
  priceCents: number;
  currency: string;
  quantity: number;
}

export function NewOrder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [productPick, setProductPick] = useState('');
  const [pickedProduct, setPickedProduct] = useState<Product | null>(null);
  const [quantityPick, setQuantityPick] = useState(1);
  const [taxDollars, setTaxDollars] = useState('0');
  const [shippingDollars, setShippingDollars] = useState('0');

  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    [items],
  );

  const taxCents = Math.max(0, Math.round(Number(taxDollars) * 100) || 0);
  const shippingCents = Math.max(0, Math.round(Number(shippingDollars) * 100) || 0);
  const totalCents = subtotalCents + taxCents + shippingCents;

  const addItem = () => {
    if (!pickedProduct) return;
    const product = pickedProduct;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantityPick } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          currency: product.currency,
          quantity: quantityPick,
        },
      ];
    });
    setProductPick('');
    setPickedProduct(null);
    setQuantityPick(1);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const createOrder = useMutation({
    mutationFn: () =>
      ordersApi.create({
        customerId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        taxCents: taxCents || undefined,
        shippingCents: shippingCents || undefined,
      }),
    onSuccess: (order) => navigate(`/orders/${order.id}`),
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const canSubmit = customerId && items.length > 0 && !createOrder.isPending;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/orders">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={ClipboardList} title={t('orders.new')} />

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-1.5">
            <Label>{t('orders.customer')}</Label>
            <AsyncCombobox
              value={customerId}
              onChange={(id) => setCustomerId(id)}
              placeholder={`${t('orders.customer')}…`}
              queryKey={['customers', { isActive: true }]}
              fetchPage={(search, page) =>
                customersApi
                  .list({ search: search || undefined, isActive: true, page, pageSize: 20 })
                  .then((r) => ({ items: r.items, total: r.total }))
              }
              getItemId={(c) => c.id}
              getItemLabel={(c) => `${c.name} (${c.email})`}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('orders.items')}</Label>
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                {t('orders.no_items')}
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>{t('carts.product')}</TableHead>
                      <TableHead>{t('carts.quantity')}</TableHead>
                      <TableHead>{t('products.price')}</TableHead>
                      <TableHead>{t('orders.total')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((i) => (
                      <TableRow key={i.productId} className="hover:bg-transparent">
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell>{i.quantity}</TableCell>
                        <TableCell>{formatMoney(i.priceCents, i.currency)}</TableCell>
                        <TableCell>{formatMoney(i.priceCents * i.quantity, i.currency)}</TableCell>
                        <TableCell className="text-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeItem(i.productId)}
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3 pt-1">
              <div className="min-w-64 flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">{t('carts.product')}</Label>
                <AsyncCombobox
                  value={productPick}
                  onChange={(id, item) => {
                    setProductPick(id);
                    setPickedProduct(item);
                  }}
                  placeholder={`${t('carts.product')}…`}
                  queryKey={['products', { isActive: true }]}
                  fetchPage={(search, page) =>
                    productsApi
                      .list({ search: search || undefined, isActive: true, page, pageSize: 20 })
                      .then((r) => ({ items: r.items, total: r.total }))
                  }
                  getItemId={(p) => p.id}
                  getItemLabel={(p) => `${p.name} (${formatMoney(p.priceCents, p.currency)})`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t('carts.quantity')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantityPick}
                  onChange={(e) => setQuantityPick(Math.max(1, Number(e.target.value)))}
                  className="w-24"
                />
              </div>
              <Button type="button" variant="outline" onClick={addItem} disabled={!pickedProduct}>
                <Plus className="h-4 w-4" />
                {t('carts.add_item')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('orders.tax')}</Label>
              <Input inputMode="decimal" value={taxDollars} onChange={(e) => setTaxDollars(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('orders.shipping')}</Label>
              <Input
                inputMode="decimal"
                value={shippingDollars}
                onChange={(e) => setShippingDollars(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.subtotal')}</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.tax')}</span>
              <span>{formatMoney(taxCents)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.shipping')}</span>
              <span>{formatMoney(shippingCents)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold">
              <span>{t('orders.total')}</span>
              <span>{formatMoney(totalCents)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => createOrder.mutate()} disabled={!canSubmit}>
              {createOrder.isPending ? t('common.working') : t('common.create')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
