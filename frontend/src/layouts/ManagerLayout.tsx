import { AuthenticatedShell } from "@/layouts/AuthenticatedShell";
import { MANAGER_NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/routes/paths";

export function ManagerLayout() {
  return (
    <AuthenticatedShell
      navItems={MANAGER_NAV_ITEMS}
      homePath={ROUTES.manager.dashboard}
    />
  );
}
