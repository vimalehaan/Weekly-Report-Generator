import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReportDetailView } from "@/components/reports/ReportDetailView";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { isApiError } from "@/services/api";
import { getReportById } from "@/services/reports";
import { ROUTES } from "@/routes/paths";
import type { Report } from "@/types/report";
import { getApiErrorMessage } from "@/utils/api-errors";
import {
  formatReportTimestamp,
  formatReportWeekRange,
} from "@/utils/report-dates";
import { formatUserDisplayName } from "@/utils/user-display";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "not-found" | "forbidden" | "error";

export function ManagerReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!reportId) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setLoadError(null);

    try {
      const data = await getReportById(reportId);
      setReport(data);
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

      setLoadError(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [reportId]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Report not found</h1>
        <p className="text-sm text-muted-foreground">
          This report does not exist or you do not have access to it.
        </p>
        <Link
          to={ROUTES.manager.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to team reports
        </Link>
      </section>
    );
  }

  if (loadState === "forbidden") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this report.
        </p>
        <Link
          to={ROUTES.manager.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to team reports
        </Link>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Team report</h1>
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load report
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadReport();
            }}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (!report) {
    return null;
  }

  const memberName = formatUserDisplayName(report.user);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to={ROUTES.manager.reports}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to team reports
        </Link>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {memberName}&apos;s report
            </h1>
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatReportWeekRange(report.weekStartDate, report.weekEndDate)}
            {" · "}
            Updated {formatReportTimestamp(report.updatedAt)}
          </p>
          <p className="text-sm text-muted-foreground">{report.user.email}</p>
        </div>
      </div>

      <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Read-only manager view. Request correction, approval, and review
        comments will be available in a later milestone.
      </p>

      <ReportDetailView report={report} />
    </section>
  );
}
