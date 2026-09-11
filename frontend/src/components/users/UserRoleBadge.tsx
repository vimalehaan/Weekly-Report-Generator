import type { RoleName } from "@/types/auth";
import { formatRoleLabel } from "@/utils/user-display";
import { cn } from "@/lib/utils";

type UserRoleBadgeProps = {
  role: RoleName;
  className?: string;
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        role === "MANAGER"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      {formatRoleLabel(role)}
    </span>
  );
}
