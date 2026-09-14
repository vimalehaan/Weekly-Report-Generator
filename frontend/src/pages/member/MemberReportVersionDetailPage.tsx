import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReportVersionSnapshotView } from "@/components/reports/ReportVersionSnapshotView";
import { Button, buttonVariants } from "@/components/ui/button";
import { getReportVersionByNumber } from "@/services/reports";
import {
  memberReportVersionsPath,
  ROUTES,
} from "@/routes/paths";
import type { ReportVersion } from "@/types/report";
import { isApiError } from "@/services/api";
import { getApiErrorMessage } from "@/utils/api-errors";
import { formatReportTimestamp } from "@/utils/report-dates";
import { cn } from "@/lib/utils";

type LoadState =
  | "loading"
  | "success"
  | "not-found"
  | "forbidden"
  | "error";

export function MemberReportVersionDetailPage() {
  const { reportId, versionNumber: versionNumberParam } = useParams<{
    reportId: string;
    versionNumber: string;
  }>();

  const [version, setVersion] = useState<ReportVersion | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedVersionNumber = versionNumberParam
    ? Number.parseInt(versionNumberParam, 10)
    : Number.NaN;

  const loadVersion = useCallback(async () => {
    if (!reportId || Number.isNaN(parsedVersionNumber) || parsedVersionNumber < 1) {
      setLoadState("not-found");
      return;
    }

    setLoadState("loading");
    setErrorMessage(null);

    try {
      const data = await getReportVersionByNumber(reportId, parsedVersionNumber);
      setVersion(data);
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
  }, [reportId, parsedVersionNumber]);

  useEffect(() => {
    void loadVersion();
  }, [loadVersion]);

  if (loadState === "loading") {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <p className="text-sm text-muted-foreground">Loading version snapshot…</p>
      </div>
    );
  }

  if (loadState === "not-found") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Version not found</h1>
        <p className="text-sm text-muted-foreground">
          This version snapshot does not exist or is not available.
        </p>
        {reportId ? (
          <Link
            to={memberReportVersionsPath(reportId)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to version list
          </Link>
        ) : (
          <Link
            to={ROUTES.member.reportsHistory}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to Report History
          </Link>
        )}
      </section>
    );
  }

  if (loadState === "forbidden") {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this version.
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

  if (loadState === "error" || !version) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Could not load version
        </h1>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadVersion()}>
          Retry
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        {reportId ? (
          <Link
            to={memberReportVersionsPath(reportId)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to version list
          </Link>
        ) : null}

        <p className="inline-flex rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-900 dark:text-amber-100">
          Historical snapshot — read only
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Version {version.versionNumber}
        </h1>

        <p className="text-sm text-muted-foreground">
          Captured {formatReportTimestamp(version.createdAt)} by{" "}
          {version.creator.firstName} {version.creator.lastName}
        </p>
      </div>

      <ReportVersionSnapshotView content={version.content} />
    </section>
  );
}
