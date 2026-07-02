import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ReceiptText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { refundsApi } from '@/features/refunds/api';
import {
  REFUND_TRANSITIONS,
  refundStatusTone,
  type RefundStatus,
} from '@/features/refunds/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { DetailRow } from '@/components/DetailRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatMoney, extractErrorMessage } from '@/lib/format';

// Tone for the action button per target status.
const actionVariant: Record<RefundStatus, 'default' | 'outline' | 'destructive'> = {
  APPROVED: 'outline',
  COMPLETED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
  REQUESTED: 'outline',
};

export function RefundDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refundQuery = useQuery({
    queryKey: ['refund', id],
    queryFn: () => refundsApi.get(id!),
    enabled: !!id,
  });

  const statusLabel = (s: RefundStatus) => t(`refunds.status.${s.toLowerCase()}`);

  const changeStatus = useMutation({
    mutationFn: (status: RefundStatus) => refundsApi.update(id!, { status }),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ['refund', id] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['order', r.orderId] });
      // Status changes free/consume refundable quantity the RefundDialog reads.
      queryClient.invalidateQueries({ queryKey: ['refundable', r.orderId] });
      toast.success(t('refunds.status_updated_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const removeRefund = useMutation({
    mutationFn: () => refundsApi.remove(id!),
    onSuccess: () => {
      const orderId = refundQuery.data?.order.id;
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      if (orderId) {
        // Deleting a refund frees the quantity/amount it had claimed.
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        queryClient.invalidateQueries({ queryKey: ['refundable', orderId] });
      }
      toast.success(t('refunds.deleted_toast'));
      navigate('/refunds');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (refundQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (refundQuery.isError || !refundQuery.data) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/refunds">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <p className="text-destructive">{extractErrorMessage(refundQuery.error)}</p>
      </div>
    );
  }

  const refund = refundQuery.data;
  const transitions = REFUND_TRANSITIONS[refund.status];

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/refunds">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        icon={ReceiptText}
        title={refund.number}
        description={
          <span>
            <Link to={`/orders/${refund.orderId}`} className="font-mono text-xs hover:underline">
              {refund.order.number}
            </Link>{' '}
            · {refund.order.customer.name} · {formatDate(refund.createdAt)}
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={statusLabel(refund.status)} tone={refundStatusTone(refund.status)} />
            {transitions.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={actionVariant[s]}
                onClick={() => changeStatus.mutate(s)}
                disabled={changeStatus.isPending}
              >
                {t(`refunds.actions.${s.toLowerCase()}`)}
              </Button>
            ))}
            {refund.status !== 'COMPLETED' && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('carts.product')}</TableHead>
              <TableHead>{t('products.price')}</TableHead>
              <TableHead>{t('carts.quantity')}</TableHead>
              <TableHead className="text-end">{t('orders.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refund.items.map((it) => (
              <TableRow key={it.id} className="hover:bg-transparent">
                <TableCell className="font-medium">
                  {it.name}
                  {it.variantName && (
                    <span className="ms-1 text-xs font-normal text-muted-foreground">· {it.variantName}</span>
                  )}
                </TableCell>
                <TableCell>{formatMoney(it.priceCents, refund.currency)}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell className="text-end font-medium">
                  {formatMoney(it.priceCents * it.quantity, refund.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('refunds.details')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <DetailRow label={t('refunds.reason')}>{t(`refunds.reasons.${refund.reason.toLowerCase()}`)}</DetailRow>
            <DetailRow label={t('refunds.amount')}>
              <span className="font-medium">{formatMoney(refund.amountCents, refund.currency)}</span>
            </DetailRow>
            <DetailRow label={t('refunds.restock')}>{refund.restock ? t('common.yes') : t('common.no')}</DetailRow>
            {refund.note && <DetailRow label={t('refunds.note')}>{refund.note}</DetailRow>}
            {refund.resolvedAt && (
              <DetailRow label={t('refunds.resolved_at')}>{formatDate(refund.resolvedAt)}</DetailRow>
            )}
          </dl>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title={t('refunds.delete_title')}
        message={t('refunds.delete_message', { number: refund.number })}
        busy={removeRefund.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => removeRefund.mutate()}
      />
    </div>
  );
}
