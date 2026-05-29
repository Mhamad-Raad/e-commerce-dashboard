import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartsApi } from '../../features/carts/api';
import { productsApi } from '../../features/products/api';
import { cartTotalCents, type CartStatus } from '../../features/carts/types';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, formatMoney, extractErrorMessage } from '../../lib/format';

const statusTone: Record<CartStatus, 'green' | 'amber' | 'slate'> = {
  OPEN: 'green',
  CHECKED_OUT: 'slate',
  ABANDONED: 'amber',
};

export function CartDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartQuery = useQuery({
    queryKey: ['cart', id],
    queryFn: () => cartsApi.get(id!),
    enabled: !!id,
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.list({ pageSize: 100, isActive: true }),
  });

  const onCartChanged = () => {
    queryClient.invalidateQueries({ queryKey: ['cart', id] });
    queryClient.invalidateQueries({ queryKey: ['carts'] });
  };

  const addItem = useMutation({
    mutationFn: () => cartsApi.addItem(id!, productId, quantity),
    onSuccess: () => {
      setProductId('');
      setQuantity(1);
      onCartChanged();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: string; qty: number }) =>
      cartsApi.updateItem(id!, itemId, qty),
    onSuccess: onCartChanged,
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartsApi.removeItem(id!, itemId),
    onSuccess: onCartChanged,
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const updateStatus = useMutation({
    mutationFn: (status: CartStatus) => cartsApi.updateStatus(id!, status),
    onSuccess: onCartChanged,
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const removeCart = useMutation({
    mutationFn: () => cartsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] });
      navigate('/carts');
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  if (cartQuery.isLoading) return <div className="text-sm text-slate-500">Loading…</div>;
  if (cartQuery.isError)
    return <div className="text-sm text-red-600">{extractErrorMessage(cartQuery.error)}</div>;
  if (!cartQuery.data) return null;

  const cart = cartQuery.data;
  const total = cartTotalCents(cart);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cart for {cart.customer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {cart.customer.email} · created {formatDate(cart.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={cart.status.replace('_', ' ').toLowerCase()} tone={statusTone[cart.status]} />
          <select
            value={cart.status}
            onChange={(e) => updateStatus.mutate(e.target.value as CartStatus)}
            disabled={updateStatus.isPending}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="OPEN">Open</option>
            <option value="CHECKED_OUT">Checked out</option>
            <option value="ABANDONED">Abandoned</option>
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
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cart.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Cart is empty.
                </td>
              </tr>
            )}
            {cart.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{item.product.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.product.sku}</td>
                <td className="px-4 py-3 text-slate-700">{formatMoney(item.priceCents)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      if (qty > 0) updateItem.mutate({ itemId: item.id, qty });
                    }}
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-slate-900">
                  {formatMoney(item.priceCents * item.quantity)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                Cart total
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatMoney(total)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Add item</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <label className="block text-xs text-slate-600">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select a product…</option>
              {productsQuery.data?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatMoney(p.priceCents, p.currency)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => {
              setError(null);
              if (productId) addItem.mutate();
            }}
            disabled={!productId || addItem.isPending}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {addItem.isPending ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete cart"
        message="Delete this cart and all its items? This can't be undone."
        confirmLabel="Delete"
        busy={removeCart.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => removeCart.mutate()}
      />
    </div>
  );
}
