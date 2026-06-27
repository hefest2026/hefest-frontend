import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

/**
 * Gate for authenticated routes. Unauthenticated visitors are redirected to
 * the login page (the SPA root).
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/hefest-frontend/" replace />;
  }

  return <Outlet />;
}
