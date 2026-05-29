import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { cartsApi } from '../../features/carts/api';
import { cartTotalCents, type CartStatus } from '../../features/carts/types';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, formatMoney, extractErrorMessage } from '../../lib/format';

const PAGE_SIZE = 20;

const statusTone: Record<CartStatus, 'green' | 'amber' | 'slate'> = {
  OPEN: 'green',
  CHECKED_OUT: 'slate',
  ABANDONED: 'amber',
};

const statusOptions: { value: CartStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CHECKED_OUT', label: 'Checked out' },
  { value: 'ABANDONED', label: 'Abandoned' },
];

export function CartsList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CartStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['carts', { search, status, page }],
    queryFn: () =>
      cartsApi.list({
        search: search || undefined,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Carts</h1>
          <p className="mt-1 text-sm text-slate-500">{data ? `${data.total} total` : ' '}</p>
        </div>
        <Link
          to="/carts/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New cart
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by customer"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as CartStatus | '');
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isFetching && !isLoading && (
          <span className="text-xs text-slate-500">Updating…</span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                  {extractErrorMessage(error)}
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No carts.
                </td>
              </tr>
            )}
            {data?.items.map((cart) => (
              <tr key={cart.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{cart.customer.name}</div>
                  <div className="text-xs text-slate-500">{cart.customer.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{cart.items.length}</td>
                <td className="px-4 py-3 text-slate-700">{formatMoney(cartTotalCents(cart))}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={cart.status.replace('_', ' ').toLowerCase()}
                    tone={statusTone[cart.status]}
                  />
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(cart.updatedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/carts/${cart.id}`} className="text-slate-700 hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            Page {data.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={data.page >= totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
