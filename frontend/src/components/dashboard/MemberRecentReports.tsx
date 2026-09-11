import { Link } from "react-router-dom";
import { ReportList } from "@/components/reports/ReportList";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes/paths";
import type { ReportListItem } from "@/types/report";
import { cn } from "@/lib/utils";

type MemberRecentReportsProps = {
  reports: ReportListItem[];
  excludeReportId: string | null;
  totalReports: number;
};

export function MemberRecentReports({
  reports,
  excludeReportId,
  totalReports,
}: MemberRecentReportsProps) {
  const recent = reports
    .filter((report) => report.id !== excludeReportId)
    .slice(0, 5);

  if (recent.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Recent reports</h2>
          <p className="text-sm text-muted-foreground">
            Your latest reporting weeks at a glance.
          </p>
        </div>
        <Link
          to={ROUTES.member.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          View all reports
        </Link>
      </div>

      <ReportList reports={recent} />

      {totalReports > recent.length + (excludeReportId ? 1 : 0) ? (
        <p className="text-xs text-muted-foreground">
          Showing {recent.length} of {totalReports} reports. Open My Reports for
          the full list and pagination.
        </p>
      ) : null}
    </section>
  );
}
