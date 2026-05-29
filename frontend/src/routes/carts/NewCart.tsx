import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { cartsApi } from '../../features/carts/api';
import { customersApi } from '../../features/customers/api';
import { extractErrorMessage } from '../../lib/format';

export function NewCart() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ['customers', 'picker'],
    queryFn: () => customersApi.list({ pageSize: 100, isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: () => cartsApi.create({ customerId }),
    onSuccess: (cart) => navigate(`/carts/${cart.id}`),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  return (
    <div className="max-w-md space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">New cart</h1>
        <p className="mt-1 text-sm text-slate-500">Create an empty cart for a customer.</p>
      </div>

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/carts')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              createMutation.mutate();
            }}
            disabled={!customerId || createMutation.isPending}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Creating…' : 'Create cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
