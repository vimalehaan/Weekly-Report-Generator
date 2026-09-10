import { Outlet } from "react-router-dom";

/**
 * Wrapper for routes accessible without authentication.
 * Auth redirects will be added in a later milestone.
 */
export function PublicRoute() {
  return <Outlet />;
}
