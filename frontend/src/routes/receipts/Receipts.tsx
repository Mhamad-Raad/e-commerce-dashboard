import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Printer } from 'lucide-react';
import { ordersApi } from '@/features/orders/api';
import { settingsApi } from '@/features/settings/api';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/lib/format';
import { Receipt } from './Receipt';

export function Receipts() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const ids = (params.get('ids') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const printedRef = useRef(false);

  const ordersQuery = useQuery({
    queryKey: ['receipts', ids],
    // allSettled so one missing/deleted id doesn't blank the whole print batch.
    queryFn: () =>
      Promise.allSettled(ids.map((id) => ordersApi.get(id))).then((results) =>
        results
          .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof ordersApi.get>>> => r.status === 'fulfilled')
          .map((r) => r.value),
      ),
    enabled: ids.length > 0,
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  const ready = ordersQuery.isSuccess && !settingsQuery.isLoading;

  // Auto-open the print dialog once everything is rendered (one-shot).
  useEffect(() => {
    if (ready && !printedRef.current) {
      printedRef.current = true;
      requestAnimationFrame(() => window.print());
    }
  }, [ready]);

  if (ids.length === 0) {
    return <p className="p-8 text-sm text-muted-foreground">{t('receipt.none_selected')}</p>;
  }
  if (ordersQuery.isError) {
    return <p className="p-8 text-destructive">{extractErrorMessage(ordersQuery.error)}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      <style>{`@media print { @page { margin: 14mm; } body { background: #fff; } }`}</style>

      <div className="mx-auto mb-6 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()} disabled={!ready}>
          <Printer className="h-4 w-4" />
          {t('receipt.print')}
        </Button>
      </div>

      {!ready ? (
        <p className="p-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : (ordersQuery.data ?? []).length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">{t('receipt.none_loaded')}</p>
      ) : (
        (ordersQuery.data ?? []).map((order, idx) => (
          <div
            key={order.id}
            className="mx-auto mb-6 max-w-[800px] shadow-sm print:mb-0 print:shadow-none"
            style={idx < (ordersQuery.data?.length ?? 0) - 1 ? { breakAfter: 'page' } : undefined}
          >
            <Receipt order={order} settings={settingsQuery.data ?? null} />
          </div>
        ))
      )}
    </div>
  );
}
