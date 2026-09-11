import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboardPath, ROUTES } from "@/routes/paths";
import type { RoleName } from "@/types/auth";

type RoleRouteProps = {
  allowedRoles: RoleName[];
};

function pathnameMatchesGuardArea(
  pathname: string,
  allowedRoles: RoleName[],
): boolean {
  if (
    allowedRoles.includes("TEAM_MEMBER") &&
    pathname.startsWith("/member")
  ) {
    return true;
  }

  if (
    allowedRoles.includes("MANAGER") &&
    pathname.startsWith("/manager")
  ) {
    return true;
  }

  return false;
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isInitializing, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (pathnameMatchesGuardArea(location.pathname, allowedRoles)) {
      return (
        <Navigate
          to={getDefaultDashboardPath(user.role)}
          replace
          state={{ forbidden: true }}
        />
      );
    }

    return null;
  }

  return <Outlet />;
}
