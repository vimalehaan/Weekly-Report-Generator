import { ManagerReportListItem } from "@/components/reports/manager/ManagerReportListItem";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { managerReportDetailPath } from "@/routes/paths";
import type { ReportListItem } from "@/types/report";
import {
  formatReportTimestamp,
  formatReportWeekRange,
} from "@/utils/report-dates";
import { formatUserDisplayName } from "@/utils/user-display";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type ManagerReportListProps = {
  reports: ReportListItem[];
};

export function ManagerReportList({ reports }: ManagerReportListProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {reports.map((report) => (
          <article
            key={report.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {formatUserDisplayName(report.user)}
              </h3>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatReportWeekRange(
                report.weekStartDate,
                report.weekEndDate,
              )}
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Tasks</dt>
                <dd>{report._count.reportTasks}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Achievements</dt>
                <dd>{report._count.achievements}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Blockers</dt>
                <dd>{report._count.blockers}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatReportTimestamp(report.updatedAt)}
            </p>
            <Link
              to={managerReportDetailPath(report.id)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 inline-flex",
              )}
            >
              Open
            </Link>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Team member</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Week
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Tasks
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Achievements
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Blockers
              </th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">
                Updated
              </th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <ManagerReportListItem key={report.id} report={report} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
