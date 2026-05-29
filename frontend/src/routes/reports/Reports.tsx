import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../features/reports/api';
import { orderStatusTone } from '../../features/orders/api';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, formatMoney, extractErrorMessage } from '../../lib/format';

export function Reports() {
  const summary = useQuery({ queryKey: ['reports', 'summary'], queryFn: reportsApi.summary });
  const top = useQuery({ queryKey: ['reports', 'top-products'], queryFn: () => reportsApi.topProducts(10) });
  const recent = useQuery({ queryKey: ['reports', 'recent-orders'], queryFn: () => reportsApi.recentOrders(10) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Sales overview, orders, and top products.</p>
      </div>

      <section>
        {summary.isError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {extractErrorMessage(summary.error)}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Revenue"
            value={summary.data ? formatMoney(summary.data.revenueCents) : '—'}
            loading={summary.isLoading}
          />
          <StatCard
            label="Orders"
            value={summary.data ? String(summary.data.orderCount) : '—'}
            loading={summary.isLoading}
          />
          <StatCard
            label="Avg. order value"
            value={summary.data ? formatMoney(summary.data.aovCents) : '—'}
            loading={summary.isLoading}
          />
          <StatCard
            label="Active customers"
            value={summary.data ? String(summary.data.customerCount) : '—'}
            loading={summary.isLoading}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Orders by status">
          {summary.isLoading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : summary.data && summary.data.ordersByStatus.length > 0 ? (
            <ul className="space-y-2">
              {summary.data.ordersByStatus.map(({ status, count }) => (
                <li key={status} className="flex items-center justify-between text-sm">
                  <StatusBadge label={status.toLowerCase()} tone={orderStatusTone(status)} />
                  <span className="font-medium text-slate-900">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500">No orders yet.</div>
          )}
        </Panel>

        <Panel title="Top products">
          {top.isLoading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : top.data && top.data.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Units</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top.data.map((p) => (
                  <tr key={p.productId}>
                    <td className="py-2">
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="font-mono text-xs text-slate-500">{p.sku}</div>
                    </td>
                    <td className="py-2 text-right text-slate-700">{p.units}</td>
                    <td className="py-2 text-right text-slate-900">
                      {formatMoney(p.revenueCents, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-slate-500">No sales yet.</div>
          )}
        </Panel>
      </section>

      <section>
        <Panel title="Recent orders">
          {recent.isLoading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : recent.data && recent.data.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Order #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.data.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 font-mono text-xs text-slate-700">
                      <Link to={`/orders/${o.id}`} className="hover:underline">
                        {o.number}
                      </Link>
                    </td>
                    <td className="py-2">
                      <div className="font-medium text-slate-900">{o.customer.name}</div>
                      <div className="text-xs text-slate-500">{o.customer.email}</div>
                    </td>
                    <td className="py-2 text-slate-900">{formatMoney(o.totalCents, o.currency)}</td>
                    <td className="py-2">
                      <StatusBadge label={o.status.toLowerCase()} tone={orderStatusTone(o.status)} />
                    </td>
                    <td className="py-2 text-slate-500">{formatDate(o.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-slate-500">No orders yet.</div>
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{loading ? '…' : value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
