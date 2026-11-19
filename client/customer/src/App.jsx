import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LanguageProvider } from "./i18n.jsx";
import { ToastProvider } from "./ui/index.js";
import ShopHome from "./pages/ShopHome.jsx";
import ItemPage from "./pages/ItemPage.jsx";
import OrderLookup from "./pages/OrderLookup.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Checkout from "./pages/Checkout.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Account from "./pages/Account.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import RefundPolicy from "./pages/RefundPolicy.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminAuth from "./admin/AdminAuth.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import { AdminDashboard, AdminOrders, AdminProducts } from "./admin/AdminPages.jsx";
import InventoryPage from "./admin/InventoryPage.jsx";
import SettingsPage from "./admin/SettingsPage.jsx";
import OrderDetailPage from "./admin/OrderDetailPage.jsx";
import ProductEditor from "./admin/ProductEditorPage.jsx";
import { useAuthStore } from "./stores/authStore.js";

function PrivateRoute({ element }) {
  const auth = useAuthStore();
  const location = useLocation();
  if (auth.status === "unauthenticated") {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return element;
}

function AdminPrivateRoute({ element }) {
  const auth = useAuthStore();
  const location = useLocation();
  if (auth.status === "unauthenticated") {
    return <Navigate to={`/admin/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return element;
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<ShopHome />} />
          <Route path="/store" element={<Navigate to="/" replace />} />
          <Route path="/store/:slug" element={<ShopHome />} />
          <Route path="/_index" element={<Navigate to="/" replace />} />
          <Route path="/_index/:slug" element={<Navigate to="/:slug" replace />} />
          <Route path="/order" element={<Navigate to="/checkout" replace />} />
          <Route path="/order/:legacySlug" element={<Navigate to="/checkout" replace />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/orders/lookup" element={<OrderLookup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/checkout" element={<PrivateRoute element={<Checkout />} />} />
          <Route path="/checkout/:orderId" element={<PrivateRoute element={<Checkout />} />} />
          <Route path="/orders" element={<PrivateRoute element={<MyOrders />} />} />
          <Route path="/orders/:id" element={<PrivateRoute element={<OrderDetail />} />} />
          <Route path="/account" element={<PrivateRoute element={<Account />} />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin"
            element={<AdminPrivateRoute element={<AdminLayout />} />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/:id" element={<ProductEditor />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/:slug" element={<ShopHome />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </LanguageProvider>
  );
}






