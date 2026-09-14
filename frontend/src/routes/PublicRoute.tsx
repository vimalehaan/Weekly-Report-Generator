import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboardPath, ROUTES } from "@/routes/paths";

export function PublicRoute() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  const isAuthPage =
    location.pathname === ROUTES.login ||
    location.pathname === ROUTES.register;

  if (isAuthenticated && user && isAuthPage) {
    const fromPath = (location.state as { from?: string } | null)?.from;
    const redirectPath =
      fromPath ?? getDefaultDashboardPath(user.role);

    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
