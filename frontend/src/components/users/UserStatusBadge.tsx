import { cn } from "@/lib/utils";

type UserStatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

export function UserStatusBadge({ isActive, className }: UserStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        isActive
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
