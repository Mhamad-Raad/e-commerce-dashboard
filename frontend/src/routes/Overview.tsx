import { useAuth } from '../lib/auth';

export function Overview() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {user?.name ?? user?.email}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quick stats and recent activity will live here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Products', 'Customers', 'Orders today', 'Revenue (30d)'].map((label) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
