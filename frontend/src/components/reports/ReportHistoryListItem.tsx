import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import {
  memberReportDetailPath,
  memberReportVersionsPath,
} from "@/routes/paths";
import type { ReportListItem as ReportListItemData, ReportStatus } from "@/types/report";
import {
  formatReportTimestamp,
  formatReportWeekRange,
} from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type ReportHistoryListItemProps = {
  report: ReportListItemData;
};

const VERSIONED_STATUSES: ReportStatus[] = [
  "SUBMITTED",
  "NEEDS_CORRECTION",
  "APPROVED",
];

function formatTaskSummary(count: number): string {
  if (count === 0) {
    return "No tasks logged";
  }

  if (count === 1) {
    return "1 task";
  }

  return `${count} tasks`;
}

export function ReportHistoryListItem({ report }: ReportHistoryListItemProps) {
  const detailPath = memberReportDetailPath(report.id);
  const versionsPath = memberReportVersionsPath(report.id);
  const showVersionsLink = VERSIONED_STATUSES.includes(report.status);

  const taskSummary = formatTaskSummary(report._count.reportTasks);

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
            </h2>
            <ReportStatusBadge status={report.status} />
          </div>

          <p className="text-sm text-muted-foreground">{taskSummary}</p>

          <p className="text-xs text-muted-foreground">
            Updated {formatReportTimestamp(report.updatedAt)}
          </p>

          {showVersionsLink ? (
            <p className="text-xs text-muted-foreground">
              Submitted snapshots may be available for this report.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Draft reports do not have submitted version snapshots yet.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
          <Link
            to={detailPath}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Current report
          </Link>
          {showVersionsLink ? (
            <Link
              to={versionsPath}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Versions
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
