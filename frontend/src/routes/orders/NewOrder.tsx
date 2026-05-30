import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { customersApi } from '@/features/customers/api';
import { productsApi } from '@/features/products/api';
import { ordersApi } from '@/features/orders/api';
import { PageHeader } from '@/components/PageHeader';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatMoney, extractErrorMessage } from '@/lib/format';

interface DraftItem {
  productId: string;
  quantity: number;
}

export function NewOrder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [productPick, setProductPick] = useState('');
  const [quantityPick, setQuantityPick] = useState(1);
  const [taxDollars, setTaxDollars] = useState('0');
  const [shippingDollars, setShippingDollars] = useState('0');

  const customersQuery = useQuery({
    queryKey: ['customers', 'picker'],
    queryFn: () => customersApi.list({ pageSize: 100, isActive: true }),
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.list({ pageSize: 100, isActive: true }),
  });

  const productsById = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; priceCents: number; currency: string }>();
    productsQuery.data?.items.forEach((p) => map.set(p.id, p));
    return map;
  }, [productsQuery.data]);

  const subtotalCents = useMemo(
    () =>
      items.reduce((sum, i) => {
        const p = productsById.get(i.productId);
        return p ? sum + p.priceCents * i.quantity : sum;
      }, 0),
    [items, productsById],
  );

  const taxCents = Math.max(0, Math.round(Number(taxDollars) * 100) || 0);
  const shippingCents = Math.max(0, Math.round(Number(shippingDollars) * 100) || 0);
  const totalCents = subtotalCents + taxCents + shippingCents;

  const addItem = () => {
    if (!productPick) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productPick);
      if (existing) {
        return prev.map((i) =>
          i.productId === productPick ? { ...i, quantity: i.quantity + quantityPick } : i,
        );
      }
      return [...prev, { productId: productPick, quantity: quantityPick }];
    });
    setProductPick('');
    setQuantityPick(1);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const createOrder = useMutation({
    mutationFn: () =>
      ordersApi.create({
        customerId,
        items,
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
            <Select value={customerId || undefined} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder={`${t('orders.customer')}…`} />
              </SelectTrigger>
              <SelectContent>
                {customersQuery.data?.items.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('orders.items')}</Label>
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                {t('carts.empty_cart')}
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
                    {items.map((i) => {
                      const p = productsById.get(i.productId);
                      if (!p) return null;
                      return (
                        <TableRow key={i.productId} className="hover:bg-transparent">
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{i.quantity}</TableCell>
                          <TableCell>{formatMoney(p.priceCents, p.currency)}</TableCell>
                          <TableCell>{formatMoney(p.priceCents * i.quantity, p.currency)}</TableCell>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3 pt-1">
              <div className="min-w-64 flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">{t('carts.product')}</Label>
                <Select value={productPick || undefined} onValueChange={setProductPick}>
                  <SelectTrigger>
                    <SelectValue placeholder={`${t('carts.product')}…`} />
                  </SelectTrigger>
                  <SelectContent>
                    {productsQuery.data?.items.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({formatMoney(p.priceCents, p.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="button" variant="outline" onClick={addItem} disabled={!productPick}>
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
