import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, orderStatusTone } from '../../features/orders/api';
import type { OrderStatus } from '../../features/orders/types';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, formatMoney, extractErrorMessage } from '../../lib/format';

const statuses: OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const removeOrder = useMutation({
    mutationFn: () => ordersApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  if (orderQuery.isLoading) return <div className="text-sm text-slate-500">Loading…</div>;
  if (orderQuery.isError)
    return <div className="text-sm text-red-600">{extractErrorMessage(orderQuery.error)}</div>;
  if (!orderQuery.data) return null;

  const order = orderQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-xs text-slate-500">{order.number}</div>
          <h1 className="text-2xl font-semibold text-slate-900">{order.customer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.customer.email} · placed {formatDate(order.placedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={order.status.toLowerCase()} tone={orderStatusTone(order.status)} />
          <select
            value={order.status}
            onChange={(e) => updateStatus.mutate(e.target.value as OrderStatus)}
            disabled={updateStatus.isPending}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.sku}</td>
                <td className="px-4 py-3 text-slate-700">
                  {formatMoney(item.priceCents, order.currency)}
                </td>
                <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                <td className="px-4 py-3 text-slate-900">
                  {formatMoney(item.priceCents * item.quantity, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-sm rounded-2xl bg-white p-5 text-sm shadow-sm ring-1 ring-slate-200">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotalCents, order.currency)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tax</span>
          <span>{formatMoney(order.taxCents, order.currency)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{formatMoney(order.shippingCents, order.currency)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatMoney(order.totalCents, order.currency)}</span>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete order"
        message="Delete this order and all its items? This can't be undone."
        confirmLabel="Delete"
        busy={removeOrder.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => removeOrder.mutate()}
      />
    </div>
  );
}
