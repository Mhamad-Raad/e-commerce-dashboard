import { Route, Routes } from 'react-router-dom';
import { Login } from './routes/Login';
import { Overview } from './routes/Overview';
import { ComingSoon } from './routes/ComingSoon';
import { ProductsList } from './routes/products/ProductsList';
import { ProductForm } from './routes/products/ProductForm';
import { CustomersList } from './routes/customers/CustomersList';
import { CustomerForm } from './routes/customers/CustomerForm';
import { CartsList } from './routes/carts/CartsList';
import { NewCart } from './routes/carts/NewCart';
import { CartDetail } from './routes/carts/CartDetail';
import { OrdersList } from './routes/orders/OrdersList';
import { NewOrder } from './routes/orders/NewOrder';
import { OrderDetail } from './routes/orders/OrderDetail';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

export default function App() {
  return (
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
        <Route path="/products" element={<ProductsList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/carts" element={<CartsList />} />
        <Route path="/carts/new" element={<NewCart />} />
        <Route path="/carts/:id" element={<CartDetail />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/reports" element={<ComingSoon title="Reports" />} />
      </Route>
    </Routes>
  );
}
