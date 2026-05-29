import { useAuth } from '../lib/auth';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user?.email}</span>
            <button
              onClick={() => logout()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-medium text-slate-900">Welcome, {user?.name ?? user?.email}</h2>
          <p className="mt-1 text-sm text-slate-500">
            CRUD modules (customers, products, carts, orders, reports) will go here.
          </p>
        </div>
      </main>
    </div>
  );
}
