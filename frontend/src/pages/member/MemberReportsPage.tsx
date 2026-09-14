import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReportList } from "@/components/reports/ReportList";
import { ReportPagination } from "@/components/reports/ReportPagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { getReports } from "@/services/reports";
import { ROUTES } from "@/routes/paths";
import type { PaginationMeta, ReportListItem } from "@/types/report";
import { getApiErrorMessage } from "@/utils/api-errors";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "error";

export function MemberReportsPage() {
  const [page, setPage] = useState(1);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReports = useCallback(async (pageToLoad: number) => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const result = await getReports({ page: pageToLoad });
      setReports(result.reports);
      setPagination(result.pagination);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadReports(page);
  }, [page, loadReports]);

  function handleRetry() {
    void loadReports(page);
  }

  const isEmpty =
    loadState === "success" && reports.length === 0 && pagination?.total === 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Reports</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            View and manage your weekly work reports. Create a new report when
            you are ready to log this week&apos;s progress.
          </p>
        </div>

        <Link
          to={ROUTES.member.reportsNew}
          className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          New Report
        </Link>
      </div>

      {loadState === "loading" ? (
        <div
          className="flex min-h-[240px] items-center justify-center rounded-lg border border-border bg-card"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-sm text-muted-foreground">Loading reports…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load reports
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-foreground">No reports yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            You haven&apos;t created any weekly reports. Start your first report
            to track tasks, achievements, and blockers for the week.
          </p>
          <Link
            to={ROUTES.member.reportsNew}
            className={cn(buttonVariants({ size: "sm" }), "mt-6 inline-flex")}
          >
            Create Report
          </Link>
        </div>
      ) : null}

      {loadState === "success" && reports.length > 0 && pagination ? (
        <>
          <ReportList reports={reports} />
          <ReportPagination
            pagination={pagination}
            disabled={loadState !== "success"}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </section>
  );
}
