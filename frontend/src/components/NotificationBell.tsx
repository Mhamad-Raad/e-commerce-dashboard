import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi } from '@/features/notifications/api';
import type { AppNotification } from '@/features/notifications/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDate, formatMoney } from '@/lib/format';

const POLL_MS = 30_000;

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const seenIds = useRef<Set<string> | null>(null);

  const unread = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: POLL_MS,
  });

  const listQuery = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.list({ pageSize: 15 }),
    refetchInterval: POLL_MS,
  });

  const describe = (n: AppNotification): string => {
    const meta = n.meta ?? {};
    const amount = formatMoney(Number(meta.amountCents ?? 0), String(meta.currency ?? 'IQD'));
    if (n.type === 'ORDER_CREATED') {
      return t('notifications.order_created', {
        number: String(meta.number ?? ''),
        customer: String(meta.customerName ?? ''),
        amount,
      });
    }
    return t('notifications.refund_requested', {
      number: String(meta.number ?? ''),
      order: String(meta.orderNumber ?? ''),
      amount,
    });
  };

  // Toast notifications that appeared since the last poll (skip the first load).
  useEffect(() => {
    const items = listQuery.data?.items;
    if (!items) return;
    if (seenIds.current === null) {
      seenIds.current = new Set(items.map((n) => n.id));
      return;
    }
    const fresh = items.filter((n) => !seenIds.current!.has(n.id));
    for (const n of fresh.reverse()) {
      toast(describe(n), { action: n.link ? { label: t('common.view'), onClick: () => navigate(n.link!) } : undefined });
    }
    items.forEach((n) => seenIds.current!.add(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery.data]);

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const onItemClick = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const count = unread.data?.count ?? 0;
  const items = listQuery.data?.items ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t('notifications.title')}>
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">{t('notifications.title')}</span>
          {count > 0 && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => markAll.mutate()}>
              <CheckCheck className="h-3.5 w-3.5" />
              {t('notifications.mark_all_read')}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t('notifications.empty')}</p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={cn(
                      'flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-start text-sm hover:bg-muted/60',
                      !n.isRead && 'bg-primary/5',
                    )}
                  >
                    <span className="flex w-full items-start gap-2">
                      {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className={cn('flex-1', n.isRead && 'text-muted-foreground')}>{describe(n)}</span>
                    </span>
                    <span className="ps-3.5 text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
