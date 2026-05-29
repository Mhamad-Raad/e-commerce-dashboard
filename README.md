# E-commerce Admin Dashboard

Admin dashboard for an e-commerce mobile app. Manages customers, products, carts, orders, and reports.

- **Backend**: NestJS + Prisma + PostgreSQL, JWT access + refresh (httpOnly cookie)
- **Frontend**: React + Vite + TypeScript + Tailwind v4

## Prerequisites

- Node.js 20+ (you have v24)
- PostgreSQL 14+ running locally (or a remote URL)

## Backend setup

```bash
cd backend
cp .env.example .env      # already created, edit if needed
# Make sure DATABASE_URL in .env points to a running Postgres instance
npm run prisma:migrate    # creates the User table
npm run db:seed           # creates the seed admin
npm run start:dev         # starts API on http://localhost:3000/api
```

Default seed credentials (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`):

```
email:    admin@example.com
password: Admin123!
```

### Endpoints

| Method | Path                | Auth                | Purpose                     |
|--------|---------------------|---------------------|-----------------------------|
| POST   | `/api/auth/login`   | public              | Returns `accessToken` + sets `refresh_token` cookie |
| POST   | `/api/auth/refresh` | refresh cookie      | Rotates tokens              |
| POST   | `/api/auth/logout`  | access token        | Clears server refresh hash + cookie |
| GET    | `/api/auth/me`      | access token        | Current user                |

## Frontend setup

```bash
cd frontend
npm run dev               # http://localhost:5173 (proxies /api -> backend)
```

Open `http://localhost:5173`, sign in with the seed credentials, and you'll land on the dashboard placeholder.

## Project layout

```
ecommerce-dashboard/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # User model (extend with Product, Order, etc.)
│   │   └── seed.ts
│   └── src/
│       ├── auth/            # login/refresh/logout/me, JWT strategies, guards
│       ├── prisma/          # PrismaService (global)
│       ├── users/
│       ├── app.module.ts
│       └── main.ts          # helmet, cookie-parser, CORS, ValidationPipe, /api prefix
└── frontend/
    └── src/
        ├── lib/
        │   ├── api.ts       # axios with token + refresh interceptor
        │   └── auth.tsx     # AuthProvider/useAuth, hydrates from refresh cookie
        └── routes/
            ├── Login.tsx
            ├── Dashboard.tsx       # placeholder for CRUD modules
            └── ProtectedRoute.tsx
```

## Next phase

CRUD modules to add on the backend (each = Prisma model + service + controller + DTOs):

- Products
- Customers
- Carts
- Orders
- Reports (read-only aggregations)

Matching frontend pages with a table + form pattern.
