import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboardPath } from "@/routes/paths";

export function PublicRoute() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated && user) {
    const fromPath = (location.state as { from?: string } | null)?.from;
    const redirectPath =
      fromPath ?? getDefaultDashboardPath(user.role);

    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
