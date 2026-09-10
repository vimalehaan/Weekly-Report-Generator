import { Navigate, Outlet } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboardPath, ROUTES } from "@/routes/paths";
import type { RoleName } from "@/types/auth";

type RoleRouteProps = {
  allowedRoles: RoleName[];
};

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isInitializing, isAuthenticated } = useAuth();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={getDefaultDashboardPath(user.role)}
        replace
        state={{ forbidden: true }}
      />
    );
  }

  return <Outlet />;
}
