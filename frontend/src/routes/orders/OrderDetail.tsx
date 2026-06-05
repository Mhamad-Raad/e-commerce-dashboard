import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClipboardList, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi, orderStatusTone } from '@/features/orders/api';
import { ORDER_STATUSES, type OrderStatus } from '@/features/orders/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { humanizeGeo } from '@/lib/iraqGeo';
import { OrderPayments } from './OrderPayments';
import { OrderTimeline } from './OrderTimeline';
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

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    setTrackingInput(orderQuery.data?.trackingNumber ?? '');
  }, [orderQuery.data?.trackingNumber]);

  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('orders.status_updated_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const updateTracking = useMutation({
    mutationFn: () => ordersApi.update(id!, { trackingNumber: trackingInput.trim() || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success(t('orders.tracking_saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const removeOrder = useMutation({
    mutationFn: () => ordersApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('orders.deleted_toast'));
      navigate('/orders');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const statusLabel = (s: OrderStatus) => t(`orders.status.${s.toLowerCase()}`);

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <p className="text-destructive">{extractErrorMessage(orderQuery.error)}</p>
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/orders">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        icon={ClipboardList}
        title={order.customer.name}
        description={
          <span>
            <span className="font-mono text-xs">{order.number}</span> · {order.customer.email} ·{' '}
            {formatDate(order.placedAt)}
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusLabel(order.status)} tone={orderStatusTone(order.status)} />
            <Select
              value={order.status}
              onValueChange={(v) => updateStatus.mutate(v as OrderStatus)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </div>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('carts.product')}</TableHead>
              <TableHead>{t('products.sku')}</TableHead>
              <TableHead>{t('products.price')}</TableHead>
              <TableHead>{t('carts.quantity')}</TableHead>
              <TableHead className="text-end">{t('orders.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id} className="hover:bg-transparent">
                <TableCell className="font-medium">
                  {item.name}
                  {item.variantName && (
                    <span className="ms-1 text-xs font-normal text-muted-foreground">
                      · {item.variantName}
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                <TableCell>{formatMoney(item.priceCents, order.currency)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-end font-medium">
                  {formatMoney(item.priceCents * item.quantity, order.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {order.shipGovernorate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {t('orders.shipping_address')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm">
            {order.shipName && <p className="font-medium">{order.shipName}</p>}
            <p className="text-muted-foreground">
              {humanizeGeo(order.shipCity)}, {humanizeGeo(order.shipGovernorate)}
            </p>
            {(order.shipDistrict || order.shipStreet) && (
              <p className="text-muted-foreground">
                {[order.shipDistrict, order.shipStreet].filter(Boolean).join(' · ')}
              </p>
            )}
            {order.shipLandmark && (
              <p className="text-xs text-muted-foreground">{order.shipLandmark}</p>
            )}
            {order.shipPhone && <p className="mt-1 font-mono text-xs">{order.shipPhone}</p>}
          </CardContent>
        </Card>
      )}

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('checkout.notes')}</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap pt-0 text-sm text-muted-foreground">
            {order.notes}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('orders.tracking')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 pt-0">
          <Input
            className="max-w-xs font-mono"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder={t('orders.tracking_placeholder')}
          />
          <Button
            variant="outline"
            onClick={() => updateTracking.mutate()}
            disabled={updateTracking.isPending || trackingInput.trim() === (order.trackingNumber ?? '')}
          >
            {updateTracking.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <OrderPayments order={order} />

      <Card className="ms-auto max-w-sm">
        <CardContent className="space-y-1.5 p-5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('orders.subtotal')}</span>
            <span>{formatMoney(order.subtotalCents, order.currency)}</span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>
                {t('coupons.discount')}
                {order.couponCode && <span className="ms-1 font-mono text-xs">({order.couponCode})</span>}
              </span>
              <span>−{formatMoney(order.discountCents, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>{t('orders.tax')}</span>
            <span>{formatMoney(order.taxCents, order.currency)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{t('orders.shipping')}</span>
            <span>{formatMoney(order.shippingCents, order.currency)}</span>
          </div>
          {order.feesCents > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{order.feesLabel || t('orders.fees')}</span>
              <span>{formatMoney(order.feesCents, order.currency)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
            <span>{t('orders.total')}</span>
            <span>{formatMoney(order.totalCents, order.currency)}</span>
          </div>
        </CardContent>
      </Card>

      <OrderTimeline order={order} />

      <ConfirmDialog
        open={confirmDelete}
        title={t('orders.delete_title')}
        message={t('orders.delete_message', { number: order.number })}
        busy={removeOrder.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => removeOrder.mutate()}
      />
    </div>
  );
}
