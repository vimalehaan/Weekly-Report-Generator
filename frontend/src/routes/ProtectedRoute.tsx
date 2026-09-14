import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/paths";

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
