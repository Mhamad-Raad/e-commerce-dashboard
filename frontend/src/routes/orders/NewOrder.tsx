import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { customersApi } from '@/features/customers/api';
import { productsApi, variantsApi } from '@/features/products/api';
import type { Product } from '@/features/products/types';
import { ordersApi } from '@/features/orders/api';
import { PageHeader } from '@/components/PageHeader';
import { AsyncCombobox } from '@/components/AsyncCombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoney, extractErrorMessage, toMinor } from '@/lib/format';

interface DraftItem {
  productId: string;
  variantId: string | null;
  variantName: string | null;
  name: string;
  priceCents: number;
  currency: string;
  quantity: number;
}

const lineKey = (productId: string, variantId: string | null) =>
  `${productId}:${variantId ?? ''}`;

export function NewOrder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [productPick, setProductPick] = useState('');
  const [pickedProduct, setPickedProduct] = useState<Product | null>(null);
  const [variantPick, setVariantPick] = useState('');
  const [quantityPick, setQuantityPick] = useState(1);
  const [taxInput, setTaxInput] = useState('0');
  const [shippingInput, setShippingInput] = useState('0');

  // Order currency follows the items (all products share IQD by default).
  const currency = items[0]?.currency ?? pickedProduct?.currency ?? 'IQD';

  const hasVariants = (pickedProduct?._count?.variants ?? 0) > 0;
  const { data: variantOptions } = useQuery({
    queryKey: ['product-variants', pickedProduct?.id],
    queryFn: () => variantsApi.list(pickedProduct!.id),
    enabled: !!pickedProduct && hasVariants,
  });
  const activeVariants = (variantOptions ?? []).filter((v) => v.isActive);

  // Reset the variant choice whenever the product changes.
  useEffect(() => {
    setVariantPick('');
  }, [pickedProduct?.id]);

  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    [items],
  );

  const taxCents = Math.max(0, toMinor(Number(taxInput) || 0, currency));
  const shippingCents = Math.max(0, toMinor(Number(shippingInput) || 0, currency));
  const totalCents = subtotalCents + taxCents + shippingCents;

  const needsVariant = hasVariants && !variantPick;

  const addItem = () => {
    if (!pickedProduct || needsVariant) return;
    const product = pickedProduct;
    const variant = activeVariants.find((v) => v.id === variantPick) ?? null;
    const draft: DraftItem = {
      productId: product.id,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      name: product.name,
      priceCents: variant?.priceCents ?? product.priceCents,
      currency: product.currency,
      quantity: quantityPick,
    };
    setItems((prev) => {
      const key = lineKey(draft.productId, draft.variantId);
      const existing = prev.find((i) => lineKey(i.productId, i.variantId) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.productId, i.variantId) === key
            ? { ...i, quantity: i.quantity + quantityPick }
            : i,
        );
      }
      return [...prev, draft];
    });
    setProductPick('');
    setPickedProduct(null);
    setVariantPick('');
    setQuantityPick(1);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.variantId) !== key));
  };

  const createOrder = useMutation({
    mutationFn: () =>
      ordersApi.create({
        customerId,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? undefined,
          quantity: i.quantity,
        })),
        taxCents: taxCents || undefined,
        shippingCents: shippingCents || undefined,
        currency,
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
                    {items.map((i) => {
                      const key = lineKey(i.productId, i.variantId);
                      return (
                        <TableRow key={key} className="hover:bg-transparent">
                          <TableCell className="font-medium">
                            {i.name}
                            {i.variantName && (
                              <span className="ms-1 text-xs font-normal text-muted-foreground">
                                · {i.variantName}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{i.quantity}</TableCell>
                          <TableCell>{formatMoney(i.priceCents, i.currency)}</TableCell>
                          <TableCell>{formatMoney(i.priceCents * i.quantity, i.currency)}</TableCell>
                          <TableCell className="text-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeItem(key)}
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
                <AsyncCombobox<Product>
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
              {hasVariants && (
                <div className="min-w-48 space-y-1">
                  <Label className="text-xs text-muted-foreground">{t('variants.name')}</Label>
                  <Select value={variantPick} onValueChange={setVariantPick}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.select_variant')} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeVariants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} — {formatMoney(v.priceCents, currency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                disabled={!pickedProduct || needsVariant}
              >
                <Plus className="h-4 w-4" />
                {t('carts.add_item')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('orders.tax')}</Label>
              <Input inputMode="decimal" value={taxInput} onChange={(e) => setTaxInput(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('orders.shipping')}</Label>
              <Input
                inputMode="decimal"
                value={shippingInput}
                onChange={(e) => setShippingInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.subtotal')}</span>
              <span>{formatMoney(subtotalCents, currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.tax')}</span>
              <span>{formatMoney(taxCents, currency)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t('orders.shipping')}</span>
              <span>{formatMoney(shippingCents, currency)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold">
              <span>{t('orders.total')}</span>
              <span>{formatMoney(totalCents, currency)}</span>
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
