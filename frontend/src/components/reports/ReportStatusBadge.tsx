import type { ReportStatus } from "@/types/report";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs correction",
  APPROVED: "Approved",
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  DRAFT: "border-border bg-muted text-muted-foreground",
  SUBMITTED: "border-primary/30 bg-primary/10 text-primary",
  NEEDS_CORRECTION:
    "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  APPROVED:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
};

type ReportStatusBadgeProps = {
  status: ReportStatus;
  className?: string;
};

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
