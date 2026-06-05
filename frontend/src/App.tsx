import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

const Login = lazy(() =>
  import('./routes/Login').then((m) => ({ default: m.Login })),
);
const Overview = lazy(() =>
  import('./routes/Overview').then((m) => ({ default: m.Overview })),
);
const ProductsList = lazy(() =>
  import('./routes/products/ProductsList').then((m) => ({ default: m.ProductsList })),
);
const ProductForm = lazy(() =>
  import('./routes/products/ProductForm').then((m) => ({ default: m.ProductForm })),
);
const ProductDetail = lazy(() =>
  import('./routes/products/ProductDetail').then((m) => ({ default: m.ProductDetail })),
);
const CategoriesList = lazy(() =>
  import('./routes/categories/CategoriesList').then((m) => ({ default: m.CategoriesList })),
);
const CategoryForm = lazy(() =>
  import('./routes/categories/CategoryForm').then((m) => ({ default: m.CategoryForm })),
);
const BrandsList = lazy(() =>
  import('./routes/brands/BrandsList').then((m) => ({ default: m.BrandsList })),
);
const BrandForm = lazy(() =>
  import('./routes/brands/BrandForm').then((m) => ({ default: m.BrandForm })),
);
const StoresList = lazy(() =>
  import('./routes/stores/StoresList').then((m) => ({ default: m.StoresList })),
);
const StoreForm = lazy(() =>
  import('./routes/stores/StoreForm').then((m) => ({ default: m.StoreForm })),
);
const StoreDetail = lazy(() =>
  import('./routes/stores/StoreDetail').then((m) => ({ default: m.StoreDetail })),
);
const Homepage = lazy(() =>
  import('./routes/homepage/Homepage').then((m) => ({ default: m.Homepage })),
);
const CustomersList = lazy(() =>
  import('./routes/customers/CustomersList').then((m) => ({ default: m.CustomersList })),
);
const CustomerForm = lazy(() =>
  import('./routes/customers/CustomerForm').then((m) => ({ default: m.CustomerForm })),
);
const CustomerDetail = lazy(() =>
  import('./routes/customers/CustomerDetail').then((m) => ({ default: m.CustomerDetail })),
);
const CartsList = lazy(() =>
  import('./routes/carts/CartsList').then((m) => ({ default: m.CartsList })),
);
const NewCart = lazy(() =>
  import('./routes/carts/NewCart').then((m) => ({ default: m.NewCart })),
);
const CartDetail = lazy(() =>
  import('./routes/carts/CartDetail').then((m) => ({ default: m.CartDetail })),
);
const OrdersList = lazy(() =>
  import('./routes/orders/OrdersList').then((m) => ({ default: m.OrdersList })),
);
const NewOrder = lazy(() =>
  import('./routes/orders/NewOrder').then((m) => ({ default: m.NewOrder })),
);
const OrderDetail = lazy(() =>
  import('./routes/orders/OrderDetail').then((m) => ({ default: m.OrderDetail })),
);
const CouponsList = lazy(() =>
  import('./routes/coupons/CouponsList').then((m) => ({ default: m.CouponsList })),
);
const Reports = lazy(() =>
  import('./routes/reports/Reports').then((m) => ({ default: m.Reports })),
);

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Overview />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/categories" element={<CategoriesList />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route path="/categories/:id/edit" element={<CategoryForm />} />
          <Route path="/brands" element={<BrandsList />} />
          <Route path="/brands/new" element={<BrandForm />} />
          <Route path="/brands/:id/edit" element={<BrandForm />} />
          <Route path="/stores" element={<StoresList />} />
          <Route path="/stores/new" element={<StoreForm />} />
          <Route path="/stores/:id" element={<StoreDetail />} />
          <Route path="/stores/:id/edit" element={<StoreForm />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/carts" element={<CartsList />} />
          <Route path="/carts/new" element={<NewCart />} />
          <Route path="/carts/:id" element={<CartDetail />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/coupons" element={<CouponsList />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
