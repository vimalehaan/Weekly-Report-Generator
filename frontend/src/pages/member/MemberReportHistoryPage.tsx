import { useCallback, useEffect, useState } from "react";
import { ReportHistoryListItem } from "@/components/reports/ReportHistoryListItem";
import { ReportPagination } from "@/components/reports/ReportPagination";
import { Button } from "@/components/ui/button";
import { getReports } from "@/services/reports";
import type { PaginationMeta, ReportListItem } from "@/types/report";
import { getApiErrorMessage } from "@/utils/api-errors";

type LoadState = "loading" | "success" | "error";

export function MemberReportHistoryPage() {
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

  const isEmpty =
    loadState === "success" && reports.length === 0 && pagination?.total === 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Report History</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse your weekly reports and open immutable snapshots from past
          submissions.
        </p>
      </div>

      {loadState === "loading" ? (
        <div
          className="flex min-h-[240px] items-center justify-center rounded-lg border border-border bg-card"
          role="status"
          aria-busy="true"
        >
          <p className="text-sm text-muted-foreground">Loading report history…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6" role="alert">
          <p className="text-sm font-medium text-foreground">
            Could not load report history
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void loadReports(page)}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-foreground">No reports yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            When you create and submit weekly reports, they will appear here with
            links to version snapshots.
          </p>
        </div>
      ) : null}

      {loadState === "success" && reports.length > 0 && pagination ? (
        <>
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id}>
                <ReportHistoryListItem report={report} />
              </li>
            ))}
          </ul>
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
