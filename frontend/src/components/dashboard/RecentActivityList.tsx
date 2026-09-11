import { Link } from "react-router-dom";
import { DashboardChartCard } from "@/components/dashboard/DashboardChartCard";
import { managerReportDetailPath } from "@/routes/paths";
import type { DashboardActivityItem } from "@/types/dashboard";
import { formatReportTimestamp } from "@/utils/report-dates";

type RecentActivityListProps = {
  items: DashboardActivityItem[];
};

function formatActivityTypeLabel(type: DashboardActivityItem["type"]): string {
  if (type === "STATUS_CHANGE") {
    return "Status change";
  }

  return "Review";
}

export function RecentActivityList({ items }: RecentActivityListProps) {
  return (
    <DashboardChartCard
      title="Recent activity"
      description="Latest status changes and review actions (up to 15 items)."
      className="lg:col-span-2"
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No recent activity for this period.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="py-3 first:pt-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.userName}
                    </span>
                    <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                      {formatActivityTypeLabel(item.type)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatReportTimestamp(item.createdAt)}
                  </p>
                </div>
                <Link
                  to={managerReportDetailPath(item.reportId)}
                  className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  View report
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardChartCard>
  );
}
