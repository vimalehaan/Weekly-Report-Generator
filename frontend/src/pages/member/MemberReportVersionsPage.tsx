import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReportVersionList } from "@/components/reports/ReportVersionList";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getReportById, getReportVersions } from "@/services/reports";
import {
  memberReportDetailPath,
  ROUTES,
} from "@/routes/paths";
import type { Report, ReportVersion } from "@/types/report";
import { isApiError } from "@/services/api";
import { getApiErrorMessage } from "@/utils/api-errors";
import {
  formatReportWeekRange,
} from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type LoadState =
  | "loading"
  | "success"
  | "not-found"
  | "forbidden"
  | "error";

export function MemberReportVersionsPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!reportId) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setErrorMessage(null);

    try {
      const [reportData, versionList] = await Promise.all([
        getReportById(reportId),
        getReportVersions(reportId),
      ]);

      setReport(reportData);
      setVersions(versionList);
      setLoadState("success");
    } catch (error) {
      if (isApiError(error)) {
        if (error.status === 404) {
          setLoadState("not-found");
          return;
        }

        if (error.status === 403) {
          setLoadState("forbidden");
          return;
        }
      }

      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [reportId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Loading versions…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Report not found</h1>
        <p className="text-sm text-muted-foreground">
          This report or its versions could not be found.
        </p>
        <Link
          to={ROUTES.member.reportsHistory}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to Report History
        </Link>
      </section>
    );
  }

  if (loadState === "forbidden") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view these versions.
        </p>
        <Link
          to={ROUTES.member.reportsHistory}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to Report History
        </Link>
      </section>
    );
  }

  if (loadState === "error" || !report) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Could not load versions
        </h1>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadData()}>
            Retry
          </Button>
          <Link
            to={ROUTES.member.reportsHistory}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Back to Report History
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          to={ROUTES.member.reportsHistory}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Report History
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Version history —{" "}
            {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
          </h1>
          <ReportStatusBadge status={report.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Submitted snapshots are immutable records of what was sent for review.
          Newest versions are listed first.
        </p>
        <Link
          to={memberReportDetailPath(report.id)}
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 text-sm")}
        >
          View current report
        </Link>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No submitted versions yet. Snapshots are created when you submit the
            report for review.
          </p>
        </div>
      ) : (
        <ReportVersionList reportId={report.id} versions={versions} />
      )}
    </section>
  );
}
