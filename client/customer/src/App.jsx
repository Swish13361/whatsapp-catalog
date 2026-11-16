import { Routes, Route, Link, Navigate, useParams } from "react-router-dom";
import Storefront from "./pages/StoreFront.jsx";
import OrderSummary from "./pages/OrderSummary.jsx";
import AdminAuth from "./admin/AdminAuth.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import { AdminDashboard, AdminOrders, AdminProducts } from "./admin/AdminPages.jsx";

// Keep in sync with api/constants/reservedSlugs.js: admin, api, login, signup, www, dashboard, store, app.
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "signup",
  "www",
  "dashboard",
  "store",
  "app",
]);

function HomePage() {
  return (
    <main className="page-message">
      <p>Visit a store link to start shopping.</p>
      <p className="home-portal-links"><Link to="/admin/login">Merchant sign in</Link><span>·</span><Link to="/admin/register">Create your shop</Link></p>
    </main>
  );
}

function StoreSlugRoute() {
  const { slug } = useParams();
  const normalizedSlug = slug.toLowerCase();

  if (RESERVED_SLUGS.has(normalizedSlug)) return <HomePage />;
  if (slug !== normalizedSlug) return <Navigate to={`/${normalizedSlug}`} replace />;
  return <Storefront />;
}

function LegacyStoreRoute() {
  const { slug } = useParams();
  return <Navigate to={`/${slug.toLowerCase()}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/store" element={<HomePage />} />
      <Route path="/store/:slug" element={<LegacyStoreRoute />} />
      <Route path="/order/:slug" element={<OrderSummary />} />
      <Route path="/admin/login" element={<AdminAuth />} />
      <Route path="/admin/register" element={<AdminAuth mode="register" />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
      </Route>
      <Route path="/:slug" element={<StoreSlugRoute />} />
      <Route path="*" element={<p className="page-message">Page not found.</p>} />
    </Routes>
  );
}