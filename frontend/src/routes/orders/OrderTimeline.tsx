import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Banknote,
  CreditCard,
  History,
  PackageCheck,
  PackagePlus,
  RefreshCcw,
  ReceiptText,
  RotateCcw,
  StickyNote,
  Truck,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { ordersApi } from '@/features/orders/api';
import type { Order, OrderEvent, OrderEventType } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatMoney } from '@/lib/format';

const icons: Record<OrderEventType, LucideIcon> = {
  CREATED: PackagePlus,
  STATUS_CHANGED: RefreshCcw,
  STOCK_RESERVED: PackageCheck,
  STOCK_RESTORED: Undo2,
  TRACKING_UPDATED: Truck,
  NOTE_UPDATED: StickyNote,
  PAYMENT_RECORDED: Banknote,
  PAYMENT_UPDATED: CreditCard,
  PAYMENT_REMOVED: CreditCard,
  REFUND_REQUESTED: ReceiptText,
  REFUND_COMPLETED: RotateCcw,
};

interface Props {
  order: Order;
}

export function OrderTimeline({ order }: Props) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['order', order.id, 'events'],
    queryFn: () => ordersApi.events(order.id),
    enabled: !!order.id,
  });

  const describe = (event: OrderEvent): string => {
    const meta = event.meta ?? {};
    const money = (v: unknown) => formatMoney(Number(v ?? 0), order.currency);
    const status = (v: unknown) => t(`orders.status.${String(v).toLowerCase()}`);
    const method = (v: unknown) => t(`payments.methods.${String(v).toLowerCase()}`);
    const payStatus = (v: unknown) => t(`payments.statuses.${String(v).toLowerCase()}`);

    switch (event.type) {
      case 'CREATED':
        return t('orders.events.created', { count: Number(meta.itemCount ?? 0), total: money(meta.totalCents) });
      case 'STATUS_CHANGED':
        return t('orders.events.status_changed', { from: status(meta.from), to: status(meta.to) });
      case 'STOCK_RESERVED':
        return t('orders.events.stock_reserved');
      case 'STOCK_RESTORED':
        return t('orders.events.stock_restored');
      case 'TRACKING_UPDATED':
        return meta.tracking
          ? t('orders.events.tracking_updated', { tracking: String(meta.tracking) })
          : t('orders.events.tracking_cleared');
      case 'NOTE_UPDATED':
        return t('orders.events.note_updated');
      case 'PAYMENT_RECORDED':
        return t('orders.events.payment_recorded', {
          amount: money(meta.amountCents),
          method: method(meta.method),
          status: payStatus(meta.status),
        });
      case 'PAYMENT_UPDATED':
        return t('orders.events.payment_updated', { amount: money(meta.amountCents), status: payStatus(meta.status) });
      case 'PAYMENT_REMOVED':
        return t('orders.events.payment_removed', { amount: money(meta.amountCents) });
      case 'REFUND_REQUESTED':
        return t('orders.events.refund_requested', {
          number: String(meta.number ?? ''),
          amount: money(meta.amountCents),
        });
      case 'REFUND_COMPLETED':
        return t('orders.events.refund_completed', {
          number: String(meta.number ?? ''),
          amount: money(meta.amountCents),
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" />
          {t('orders.timeline')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('orders.timeline_empty')}</p>
        ) : (
          <ol className="relative space-y-5 ps-6">
            <span className="absolute inset-y-1 start-2 w-px bg-border" aria-hidden />
            {data.map((event) => {
              const Icon = icons[event.type];
              return (
                <li key={event.id} className="relative">
                  <span className="absolute -start-6 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-border">
                    <Icon className="h-2.5 w-2.5 text-muted-foreground" />
                  </span>
                  <p className="text-sm">{describe(event)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
