import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultDashboardPath } from "@/routes/paths";

export function RoleHomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Navigate to={getDefaultDashboardPath(user.role)} replace />
  );
}
