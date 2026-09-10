import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/lib/utils";
import {
  AppNavItem,
  type AppNavItemConfig,
} from "@/components/layout/AppNavItem";

type AppSidebarProps = {
  items: AppNavItemConfig[];
  homePath: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AppSidebar({
  items,
  homePath,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:h-auto md:border-b-0 md:px-0 md:pb-4">
        <Link
          to={homePath}
          onClick={onMobileClose}
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {APP_NAME}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onMobileClose}
          aria-label="Close navigation menu"
        >
          <X className="size-4" />
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4 md:p-0" aria-label="Main">
        {items.map((item) => (
          <AppNavItem key={item.to} item={item} onNavigate={onMobileClose} />
        ))}
      </nav>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card p-4 shadow-lg transition-transform md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0 md:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Application sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
