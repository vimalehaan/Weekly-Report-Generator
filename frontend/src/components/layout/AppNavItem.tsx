import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export type AppNavItemConfig = {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  isActiveMatch?: (pathname: string) => boolean;
};

type AppNavItemProps = {
  item: AppNavItemConfig;
  onNavigate?: () => void;
};

function isNavItemActive(
  pathname: string,
  item: AppNavItemConfig,
): boolean {
  if (item.isActiveMatch) {
    return item.isActiveMatch(pathname);
  }

  if (item.end) {
    return pathname === item.to;
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function AppNavItem({ item, onNavigate }: AppNavItemProps) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = isNavItemActive(location.pathname, item);

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}
