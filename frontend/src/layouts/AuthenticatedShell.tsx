import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ForbiddenNotice } from "@/components/layout/ForbiddenNotice";
import { AppSidebar } from "@/components/layout/AppSidebar";
import type { AppNavItemConfig } from "@/components/layout/AppNavItem";
import { AppHeader } from "@/components/layout/AppHeader";

type AuthenticatedShellProps = {
  navItems: AppNavItemConfig[];
  homePath: string;
};

export function AuthenticatedShell({
  navItems,
  homePath,
}: AuthenticatedShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        items={navItems}
        homePath={homePath}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader
          variant="app"
          homePath={homePath}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-auto px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <ForbiddenNotice />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
