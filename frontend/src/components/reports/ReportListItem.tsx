import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { memberReportDetailPath } from "@/routes/paths";
import type { ReportListItem as ReportListItemData } from "@/types/report";
import {
  formatReportTimestamp,
  formatReportWeekRange,
} from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type ReportListItemProps = {
  report: ReportListItemData;
};

function formatTaskSummary(count: number): string {
  if (count === 0) {
    return "No tasks logged";
  }

  if (count === 1) {
    return "1 task";
  }

  return `${count} tasks`;
}

export function ReportListItem({ report }: ReportListItemProps) {
  const detailPath = memberReportDetailPath(report.id);
  const taskSummary = formatTaskSummary(report._count.reportTasks);
  const extras: string[] = [];

  if (report._count.achievements > 0) {
    extras.push(
      report._count.achievements === 1
        ? "1 achievement"
        : `${report._count.achievements} achievements`,
    );
  }

  if (report._count.blockers > 0) {
    extras.push(
      report._count.blockers === 1
        ? "1 blocker"
        : `${report._count.blockers} blockers`,
    );
  }

  const summaryLine = [taskSummary, ...extras].join(" · ");

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

          <p className="text-sm text-muted-foreground">{summaryLine}</p>

          <p className="text-xs text-muted-foreground">
            Updated {formatReportTimestamp(report.updatedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
          <Link
            to={detailPath}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
