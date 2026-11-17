import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./i18n.jsx";
import { ToastProvider } from "./ui/index.js";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import AdminSignup from "./pages/AdminSignup.jsx";
import NotFound from "./pages/NotFound.jsx";

function GuestOnly({ children }) {
  return localStorage.getItem("adminToken")
    ? <Navigate to="/dashboard" replace />
    : children;
}

function PrivateRoute({ children }) {
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      window.location.href = "/login";
    }
  }, [location]);

  if (!localStorage.getItem("adminToken")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/signup" element={<AdminSignup />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </LanguageProvider>
  );
}


