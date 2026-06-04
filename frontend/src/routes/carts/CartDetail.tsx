import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cartsApi, cartStatusTone, type CheckoutPayload } from '@/features/carts/api';
import { CheckoutDialog } from './CheckoutDialog';
import { productsApi, variantsApi } from '@/features/products/api';
import { cartSubtotalCents, cartTotalCents, type CartStatus } from '@/features/carts/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { formatDate, formatMoney, extractErrorMessage } from '@/lib/format';

const STATUSES: CartStatus[] = ['OPEN', 'CHECKED_OUT', 'ABANDONED'];

export function CartDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [couponInput, setCouponInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cartQuery = useQuery({
    queryKey: ['cart', id],
    queryFn: () => cartsApi.get(id!),
    enabled: !!id,
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.list({ pageSize: 100, isActive: true }),
  });

  const selectedProduct = productsQuery.data?.items.find((p) => p.id === productId);
  const hasVariants = (selectedProduct?._count?.variants ?? 0) > 0;
  const variantsQuery = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => variantsApi.list(productId),
    enabled: !!productId && hasVariants,
  });
  const activeVariants = (variantsQuery.data ?? []).filter((v) => v.isActive);

  // Reset the variant choice whenever the product changes.
  useEffect(() => {
    setVariantId('');
  }, [productId]);

  const onCartChanged = () => {
    queryClient.invalidateQueries({ queryKey: ['cart', id] });
    queryClient.invalidateQueries({ queryKey: ['carts'] });
  };
  const onError = (err: unknown) => toast.error(extractErrorMessage(err));

  const addItem = useMutation({
    mutationFn: () => cartsApi.addItem(id!, productId, quantity, variantId || undefined),
    onSuccess: () => {
      setProductId('');
      setVariantId('');
      setQuantity(1);
      onCartChanged();
      toast.success(t('carts.item_added_toast'));
    },
    onError,
  });

  const needsVariant = hasVariants && !variantId;

  const updateItem = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) =>
      cartsApi.updateItem(id!, itemId, qty),
    onSuccess: onCartChanged,
    onError,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartsApi.removeItem(id!, itemId),
    onSuccess: () => {
      onCartChanged();
      toast.success(t('carts.item_removed_toast'));
    },
    onError,
  });

  const updateStatus = useMutation({
    mutationFn: (status: CartStatus) => cartsApi.updateStatus(id!, status),
    onSuccess: onCartChanged,
    onError,
  });

  const applyCoupon = useMutation({
    mutationFn: () => cartsApi.applyCoupon(id!, couponInput.trim()),
    onSuccess: () => {
      setCouponInput('');
      onCartChanged();
      toast.success(t('coupons.applied_toast'));
    },
    onError,
  });

  const removeCoupon = useMutation({
    mutationFn: () => cartsApi.removeCoupon(id!),
    onSuccess: onCartChanged,
    onError,
  });

  const removeCart = useMutation({
    mutationFn: () => cartsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      toast.success(t('carts.deleted_toast'));
      navigate('/carts');
    },
    onError,
  });

  const checkout = useMutation({
    mutationFn: (payload: CheckoutPayload) => cartsApi.checkout(id!, payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCheckoutOpen(false);
      toast.success(t('checkout.success_toast'));
      navigate(`/orders/${order.id}`);
    },
    onError,
  });

  const statusLabel = (s: CartStatus) => t(`carts.status.${s.toLowerCase()}`);

  if (cartQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (cartQuery.isError || !cartQuery.data) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/carts">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <p className="text-destructive">{extractErrorMessage(cartQuery.error)}</p>
      </div>
    );
  }

  const cart = cartQuery.data;
  const subtotal = cartSubtotalCents(cart);
  const total = cartTotalCents(cart);

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/carts">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        icon={ShoppingCart}
        title={cart.customer.name}
        description={`${cart.customer.email} · ${formatDate(cart.createdAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusLabel(cart.status)} tone={cartStatusTone(cart.status)} />
            <Select value={cart.status} onValueChange={(v) => updateStatus.mutate(v as CartStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cart.status !== 'CHECKED_OUT' && cart.items.length > 0 && (
              <Button onClick={() => setCheckoutOpen(true)}>
                <CreditCard className="h-4 w-4" />
                {t('checkout.title')}
              </Button>
            )}
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </div>
        }
      />

      <Card>
        {cart.items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title={t('carts.empty_cart')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('carts.product')}</TableHead>
                <TableHead>{t('products.sku')}</TableHead>
                <TableHead>{t('products.price')}</TableHead>
                <TableHead>{t('carts.quantity')}</TableHead>
                <TableHead>{t('carts.total')}</TableHead>
                <TableHead className="text-end">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.map((item) => (
                <TableRow key={item.id} className="hover:bg-transparent">
                  <TableCell className="font-medium">
                    {item.product.name}
                    {item.variantName && (
                      <span className="ms-1 text-xs font-normal text-muted-foreground">
                        · {item.variantName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.product.sku}
                  </TableCell>
                  <TableCell>{formatMoney(item.priceCents)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        if (qty > 0) updateItem.mutate({ itemId: item.id, qty });
                      }}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(item.priceCents * item.quantity)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeItem.mutate(item.id)}
                      aria-label={t('carts.remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-end text-muted-foreground">
                  {t('orders.subtotal')}
                </TableCell>
                <TableCell colSpan={2}>{formatMoney(subtotal)}</TableCell>
              </TableRow>
              {cart.discountCents > 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="text-end text-muted-foreground">
                    {t('coupons.discount')}
                    {cart.coupon && (
                      <span className="ms-1 font-mono text-xs">({cart.coupon.code})</span>
                    )}
                  </TableCell>
                  <TableCell colSpan={2} className="text-emerald-600 dark:text-emerald-400">
                    −{formatMoney(cart.discountCents)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-end font-medium text-muted-foreground">
                  {t('carts.total')}
                </TableCell>
                <TableCell colSpan={2} className="font-semibold">
                  {formatMoney(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('coupons.coupon')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 pt-0">
          {cart.coupon ? (
            <div className="flex items-center gap-3">
              <StatusBadge label={cart.coupon.code} tone="green" />
              <span className="text-sm text-muted-foreground">
                −{formatMoney(cart.discountCents)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCoupon.mutate()}
                disabled={removeCoupon.isPending}
              >
                {t('coupons.remove')}
              </Button>
            </div>
          ) : (
            <>
              <div className="min-w-48 flex-1 space-y-1">
                <Label>{t('coupons.code')}</Label>
                <Input
                  className="font-mono uppercase"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t('coupons.code_placeholder')}
                />
              </div>
              <Button
                onClick={() => couponInput.trim() && applyCoupon.mutate()}
                disabled={!couponInput.trim() || applyCoupon.isPending}
              >
                {applyCoupon.isPending ? t('common.working') : t('coupons.apply')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('carts.add_item')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 pt-0">
          <div className="min-w-64 flex-1 space-y-1">
            <Label>{t('carts.product')}</Label>
            <Select value={productId || undefined} onValueChange={setProductId}>
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
          {hasVariants && (
            <div className="min-w-48 space-y-1">
              <Label>{t('variants.name')}</Label>
              <Select value={variantId || undefined} onValueChange={setVariantId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('products.select_variant')} />
                </SelectTrigger>
                <SelectContent>
                  {activeVariants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} — {formatMoney(v.priceCents, selectedProduct?.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>{t('carts.quantity')}</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-24"
            />
          </div>
          <Button
            onClick={() => productId && addItem.mutate()}
            disabled={!productId || needsVariant || addItem.isPending}
          >
            <Plus className="h-4 w-4" />
            {addItem.isPending ? t('common.working') : t('carts.add_to_cart')}
          </Button>
        </CardContent>
      </Card>

      <CheckoutDialog
        open={checkoutOpen}
        cart={cart}
        saving={checkout.isPending}
        onOpenChange={setCheckoutOpen}
        onSubmit={(payload) => checkout.mutate(payload)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={t('carts.delete_title')}
        message={t('carts.delete_message')}
        busy={removeCart.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => removeCart.mutate()}
      />
    </div>
  );
}
