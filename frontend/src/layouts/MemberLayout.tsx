import { AuthenticatedShell } from "@/layouts/AuthenticatedShell";
import { MEMBER_NAV_ITEMS } from "@/config/navigation";
import { ROUTES } from "@/routes/paths";

export function MemberLayout() {
  return (
    <AuthenticatedShell
      navItems={MEMBER_NAV_ITEMS}
      homePath={ROUTES.member.dashboard}
    />
  );
}
