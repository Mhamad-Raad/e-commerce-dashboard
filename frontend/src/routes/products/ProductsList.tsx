import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { productsApi } from '../../features/products/api';
import type { Product } from '../../features/products/types';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { formatDate, formatMoney, extractErrorMessage } from '../../lib/format';

const PAGE_SIZE = 20;

export function ProductsList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['products', { search, page }],
    queryFn: () =>
      productsApi.list({ search: search || undefined, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setToDelete(null);
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.total} total` : ' '}
          </p>
        </div>
        <Link
          to="/products/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New product
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        {isFetching && !isLoading && (
          <span className="text-xs text-slate-500">Updating…</span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-600">
                  {extractErrorMessage(error)}
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No products yet.{' '}
                  <Link to="/products/new" className="text-slate-900 underline">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            )}
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.sku}</td>
                <td className="px-4 py-3 text-slate-700">
                  {formatMoney(p.priceCents, p.currency)}
                </td>
                <td className="px-4 py-3 text-slate-700">{p.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.isActive
                        ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'
                        : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'
                    }
                  >
                    {p.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/products/${p.id}/edit`}
                    className="mr-3 text-slate-700 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setToDelete(p)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
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

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product"
        message={
          toDelete ? (
            <>
              Delete <span className="font-medium">{toDelete.name}</span>? This can't be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
