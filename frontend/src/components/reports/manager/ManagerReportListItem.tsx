import { Link } from "react-router-dom";
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

type ManagerReportListItemProps = {
  report: ReportListItem;
};

export function ManagerReportListItem({ report }: ManagerReportListItemProps) {
  const detailPath = managerReportDetailPath(report.id);
  const memberName = formatUserDisplayName(report.user);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 align-top">
        <span className="font-medium text-foreground">{memberName}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {report.user.email}
        </span>
      </td>
      <td className="hidden px-4 py-3 align-top text-foreground sm:table-cell">
        {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
      </td>
      <td className="px-4 py-3 align-top">
        <ReportStatusBadge status={report.status} />
      </td>
      <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
        {report._count.reportTasks}
      </td>
      <td className="hidden px-4 py-3 align-top text-muted-foreground lg:table-cell">
        {report._count.achievements}
      </td>
      <td className="hidden px-4 py-3 align-top text-muted-foreground lg:table-cell">
        {report._count.blockers}
      </td>
      <td className="hidden px-4 py-3 align-top text-xs text-muted-foreground xl:table-cell">
        {formatReportTimestamp(report.updatedAt)}
      </td>
      <td className="px-4 py-3 align-top text-right">
        <Link
          to={detailPath}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open
        </Link>
      </td>
    </tr>
  );
}
