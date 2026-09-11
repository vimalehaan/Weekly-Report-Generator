import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { REPORT_STATUSES, type ReportListItem, type ReportStatus } from "@/types/report";

type MemberReportStatusOverviewProps = {
  reports: ReportListItem[];
  isPartialDataset: boolean;
};

function countByStatus(
  reports: ReportListItem[],
  status: ReportStatus,
): number {
  return reports.filter((report) => report.status === status).length;
}

export function MemberReportStatusOverview({
  reports,
  isPartialDataset,
}: MemberReportStatusOverviewProps) {
  if (reports.length === 0) {
    return null;
  }

  const description = isPartialDataset
    ? "Status breakdown for your most recently loaded reports."
    : "How your weekly reports are distributed by status.";

  return (
    <DashboardChartCard title="Report status overview" description={description}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {REPORT_STATUSES.map((status) => {
          const count = countByStatus(reports, status);

          return (
            <li
              key={status}
              className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
            >
              <ReportStatusBadge status={status} />
              <span className="text-sm font-medium tabular-nums text-foreground">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </DashboardChartCard>
  );
}
