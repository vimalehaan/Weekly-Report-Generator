import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/paths";

export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    const redirectPath =
      (location.state as { from?: string } | null)?.from ?? ROUTES.home;

    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
