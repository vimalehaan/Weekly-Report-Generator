import { Outlet } from "react-router-dom";

/**
 * Wrapper for authenticated routes.
 * Session and role checks will be added in a later milestone.
 */
export function ProtectedRoute() {
  return <Outlet />;
}
