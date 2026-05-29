# E-commerce Admin Dashboard

Admin dashboard for an e-commerce mobile app. Manages customers, products, carts, orders, and reports.

- **Backend**: NestJS + Prisma + PostgreSQL, JWT access + refresh (httpOnly cookie)
- **Frontend**: React + Vite + TypeScript + Tailwind v4 + TanStack Query

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or a remote URL)

## Backend setup

```bash
cd backend
cp .env.example .env      # already created, edit if needed
# Make sure DATABASE_URL in .env points to a running Postgres instance
npm run prisma:migrate    # creates tables for User, Product, Customer, Cart, Order
npm run db:seed           # seeds admin + 12 products + 15 customers + 6 carts + 30 orders
npm run start:dev         # starts API on http://localhost:3000/api
```

Default admin credentials (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`):

```
email:    admin@example.com
password: Admin123!
```

### Endpoints

| Method | Path                          | Auth           | Purpose                     |
|--------|-------------------------------|----------------|-----------------------------|
| POST   | `/api/auth/login`             | public         | Returns `accessToken` + sets `refresh_token` cookie |
| POST   | `/api/auth/refresh`           | refresh cookie | Rotates tokens              |
| POST   | `/api/auth/logout`            | access token   | Clears server refresh hash + cookie |
| GET    | `/api/auth/me`                | access token   | Current user                |
| GET    | `/api/products`               | access token   | List (search, category, isActive, page, pageSize) |
| GET/POST/PATCH/DELETE | `/api/products[/:id]` | access token | Product CRUD          |
| GET    | `/api/customers`              | access token   | List (search, isActive, page, pageSize) |
| GET/POST/PATCH/DELETE | `/api/customers[/:id]`| access token | Customer CRUD          |
| GET    | `/api/carts`                  | access token   | List (search, status, customerId, page, pageSize) |
| GET/POST/PATCH/DELETE | `/api/carts[/:id]`    | access token | Cart CRUD               |
| POST   | `/api/carts/:id/items`        | access token   | Add cart item               |
| PATCH/DELETE | `/api/carts/:id/items/:itemId` | access token | Update qty / remove |
| GET    | `/api/orders`                 | access token   | List (search, status, customerId, page, pageSize) |
| GET/POST/DELETE | `/api/orders[/:id]`  | access token   | Read / Create with items / Delete |
| PATCH  | `/api/orders/:id/status`      | access token   | Change order status         |
| GET    | `/api/reports/summary`        | access token   | Revenue, orders, AOV, customers, by-status |
| GET    | `/api/reports/top-products`   | access token   | Top products by revenue     |
| GET    | `/api/reports/recent-orders`  | access token   | Latest orders               |

> Prices and totals are stored as integer minor units (`priceCents`, `subtotalCents`, etc.). The frontend converts decimal input ↔ cents at form boundaries. This avoids floating-point math on money.
> Order and cart line items snapshot the product name/sku/price at the time they're added, so historical orders read correctly even if the product is later edited or removed.

## Frontend setup

```bash
cd frontend
npm run dev               # http://localhost:5173 (proxies /api -> backend)
```

Open `http://localhost:5173`, sign in with the seed credentials, and you'll land in the dashboard.

## Project layout

```
ecommerce-dashboard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # User, Product, Customer, Cart(+Item), Order(+Item)
│   │   └── seed.ts               # admin + realistic dummy data
│   └── src/
│       ├── common/               # shared PaginationQueryDto + paginate helpers
│       ├── auth/                 # login/refresh/logout/me, JWT strategies, guards
│       ├── prisma/               # PrismaService (global)
│       ├── users/
│       ├── products/             # full CRUD
│       ├── customers/            # full CRUD
│       ├── carts/                # CRUD + items management
│       ├── orders/               # CRUD + status workflow
│       ├── reports/              # aggregations (revenue, top products, recent)
│       ├── app.module.ts
│       └── main.ts               # helmet, cookie-parser, CORS, ValidationPipe, /api prefix
└── frontend/
    └── src/
        ├── components/           # DashboardLayout, ErrorBoundary, ConfirmDialog, StatusBadge
        ├── features/             # api + types per domain
        │   ├── products/
        │   ├── customers/
        │   ├── carts/
        │   ├── orders/
        │   └── reports/
        ├── lib/
        │   ├── api.ts            # axios with token + refresh interceptor
        │   ├── auth.tsx          # AuthProvider/useAuth, hydrates from refresh cookie
        │   └── format.ts         # money/date/error helpers
        └── routes/               # one folder per module, lazy-loaded via React.lazy
```

## Status

- ✅ Auth (login, refresh, logout, me)
- ✅ Products CRUD
- ✅ Customers CRUD
- ✅ Carts CRUD + items management
- ✅ Orders CRUD + status workflow
- ✅ Reports (summary, top products, recent orders)
- ✅ Dummy data seed for showcase
- ✅ Code-split routes (lazy-loaded)
