import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ClipboardList, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi, orderStatusTone } from '@/features/orders/api';
import type { OrderStatus } from '@/features/orders/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(t('orders.status_updated_toast'));
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
                {STATUSES.map((s) => (
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
                <TableCell className="font-medium">{item.name}</TableCell>
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

      <Card className="ms-auto max-w-sm">
        <CardContent className="space-y-1.5 p-5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('orders.subtotal')}</span>
            <span>{formatMoney(order.subtotalCents, order.currency)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{t('orders.tax')}</span>
            <span>{formatMoney(order.taxCents, order.currency)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{t('orders.shipping')}</span>
            <span>{formatMoney(order.shippingCents, order.currency)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
            <span>{t('orders.total')}</span>
            <span>{formatMoney(order.totalCents, order.currency)}</span>
          </div>
        </CardContent>
      </Card>

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
