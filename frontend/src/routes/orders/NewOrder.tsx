import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { customersApi } from '../../features/customers/api';
import { productsApi } from '../../features/products/api';
import { ordersApi } from '../../features/orders/api';
import { formatMoney, extractErrorMessage } from '../../lib/format';

interface DraftItem {
  productId: string;
  quantity: number;
}

export function NewOrder() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [productPick, setProductPick] = useState('');
  const [quantityPick, setQuantityPick] = useState(1);
  const [taxDollars, setTaxDollars] = useState('0');
  const [shippingDollars, setShippingDollars] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ['customers', 'picker'],
    queryFn: () => customersApi.list({ pageSize: 100, isActive: true }),
  });

  const productsQuery = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.list({ pageSize: 100, isActive: true }),
  });

  const productsById = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; priceCents: number; currency: string }>();
    productsQuery.data?.items.forEach((p) => map.set(p.id, p));
    return map;
  }, [productsQuery.data]);

  const subtotalCents = useMemo(
    () =>
      items.reduce((sum, i) => {
        const p = productsById.get(i.productId);
        return p ? sum + p.priceCents * i.quantity : sum;
      }, 0),
    [items, productsById],
  );

  const taxCents = Math.max(0, Math.round(Number(taxDollars) * 100) || 0);
  const shippingCents = Math.max(0, Math.round(Number(shippingDollars) * 100) || 0);
  const totalCents = subtotalCents + taxCents + shippingCents;

  const addItem = () => {
    if (!productPick) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productPick);
      if (existing) {
        return prev.map((i) =>
          i.productId === productPick ? { ...i, quantity: i.quantity + quantityPick } : i,
        );
      }
      return [...prev, { productId: productPick, quantity: quantityPick }];
    });
    setProductPick('');
    setQuantityPick(1);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const createOrder = useMutation({
    mutationFn: () =>
      ordersApi.create({
        customerId,
        items,
        taxCents: taxCents || undefined,
        shippingCents: shippingCents || undefined,
      }),
    onSuccess: (order) => navigate(`/orders/${order.id}`),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const canSubmit = customerId && items.length > 0 && !createOrder.isPending;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New order</h1>
        <p className="mt-1 text-sm text-slate-500">Create an order with line items.</p>
      </div>

      <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={customersQuery.isLoading}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">Select a customer…</option>
            {customersQuery.data?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">Items</div>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
              No items yet.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Line total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i) => {
                  const p = productsById.get(i.productId);
                  if (!p) return null;
                  return (
                    <tr key={i.productId}>
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">{i.quantity}</td>
                      <td className="py-2">{formatMoney(p.priceCents, p.currency)}</td>
                      <td className="py-2">{formatMoney(p.priceCents * i.quantity, p.currency)}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeItem(i.productId)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-64 flex-1">
              <label className="block text-xs text-slate-600">Add product</label>
              <select
                value={productPick}
                onChange={(e) => setProductPick(e.target.value)}
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
                value={quantityPick}
                onChange={(e) => setQuantityPick(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!productPick}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Add item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600">Tax</label>
            <input
              inputMode="decimal"
              value={taxDollars}
              onChange={(e) => setTaxDollars(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Shipping</label>
            <input
              inputMode="decimal"
              value={shippingDollars}
              onChange={(e) => setShippingDollars(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax</span>
            <span>{formatMoney(taxCents)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{formatMoney(shippingCents)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              createOrder.mutate();
            }}
            disabled={!canSubmit}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {createOrder.isPending ? 'Creating…' : 'Create order'}
          </button>
        </div>
      </div>
    </div>
  );
}
