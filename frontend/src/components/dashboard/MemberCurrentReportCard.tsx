import { Link } from "react-router-dom";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { memberReportDetailPath, ROUTES } from "@/routes/paths";
import type { ReportListItem } from "@/types/report";
import {
  formatReportCountsSummary,
  getPrimaryActionLabel,
} from "@/utils/member-dashboard";
import { formatReportTimestamp, formatReportWeekRange } from "@/utils/report-dates";
import { getReportStatusHint } from "@/utils/report-workflow";
import { cn } from "@/lib/utils";

type MemberCurrentReportCardProps = {
  report: ReportListItem | null;
};

export function MemberCurrentReportCard({ report }: MemberCurrentReportCardProps) {
  if (!report) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-8">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          No weekly report yet
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Create your first weekly report to track tasks, achievements, and
          blockers for the week.
        </p>
        <Link
          to={ROUTES.member.reportsNew}
          className={cn(buttonVariants({ size: "sm" }), "mt-5 inline-flex")}
        >
          Create weekly report
        </Link>
      </section>
    );
  }

  const statusHint = getReportStatusHint(report.status);
  const actionLabel = getPrimaryActionLabel(report.status);
  const detailPath = memberReportDetailPath(report.id);
  const needsAction = report.status === "NEEDS_CORRECTION";

  return (
    <section
      className={cn(
        "rounded-lg border bg-card p-5 shadow-sm",
        needsAction ? "border-amber-500/40" : "border-border",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {needsAction ? "Action required" : "Your current report"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
              </h2>
              <ReportStatusBadge status={report.status} />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {formatReportCountsSummary(report)}
          </p>

          <p className="text-xs text-muted-foreground">
            Updated {formatReportTimestamp(report.updatedAt)}
          </p>

          {statusHint ? (
            <p
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                needsAction
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {statusHint}
            </p>
          ) : null}
        </div>

        <Link
          to={detailPath}
          className={cn(
            buttonVariants({ size: "sm" }),
            "shrink-0 self-start",
          )}
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}
