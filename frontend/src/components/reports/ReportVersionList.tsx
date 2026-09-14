import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { memberReportVersionDetailPath } from "@/routes/paths";
import type { ReportVersion } from "@/types/report";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type ReportVersionListProps = {
  reportId: string;
  versions: ReportVersion[];
};

export function ReportVersionList({
  reportId,
  versions,
}: ReportVersionListProps) {
  return (
    <ul className="space-y-3">
      {versions.map((version) => (
        <li
          key={version.id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Version {version.versionNumber}
            </p>
            <p className="text-sm text-muted-foreground">
              Snapshot submitted {formatReportTimestamp(version.createdAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              Created by {version.creator.firstName} {version.creator.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              Immutable historical snapshot — read only
            </p>
          </div>

          <Link
            to={memberReportVersionDetailPath(reportId, version.versionNumber)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            View snapshot
          </Link>
        </li>
      ))}
    </ul>
  );
}
