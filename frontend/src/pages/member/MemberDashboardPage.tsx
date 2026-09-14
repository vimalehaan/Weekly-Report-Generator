import { useCallback, useEffect, useMemo, useState } from "react";
import { MemberCurrentReportCard } from "@/components/dashboard/MemberCurrentReportCard";
import { MemberDashboardQuickActions } from "@/components/dashboard/MemberDashboardQuickActions";
import { MemberDashboardSummary } from "@/components/dashboard/MemberDashboardSummary";
import { MemberRecentReports } from "@/components/dashboard/MemberRecentReports";
import { MemberReportStatusOverview } from "@/components/dashboard/MemberReportStatusOverview";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getReports } from "@/services/reports";
import type { PaginationMeta, ReportListItem } from "@/types/report";
import {
  computeMemberDashboardSummary,
  selectFocusReport,
} from "@/utils/member-dashboard";
import { getApiErrorMessage } from "@/utils/api-errors";

type LoadState = "loading" | "success" | "error";

const DASHBOARD_REPORT_LIMIT = 100;

export function MemberDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const result = await getReports({ page: 1, limit: DASHBOARD_REPORT_LIMIT });
      setReports(result.reports);
      setPagination(result.pagination);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const focusReport = useMemo(
    () => selectFocusReport(reports),
    [reports],
  );

  const summaryMetrics = useMemo(() => {
    if (!pagination) {
      return null;
    }

    return computeMemberDashboardSummary(reports, pagination);
  }, [pagination, reports]);

  const firstName = user?.firstName?.trim() || "there";

  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {firstName}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Here&apos;s an overview of your weekly reports and what you need to do
          next.
        </p>
      </div>

      {loadState === "loading" ? (
        <div
          className="flex min-h-[280px] items-center justify-center rounded-lg border border-border bg-card"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load dashboard
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadDashboard();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {loadState === "success" ? (
        <>
          <MemberCurrentReportCard report={focusReport} />

          {summaryMetrics ? (
            <MemberDashboardSummary metrics={summaryMetrics} />
          ) : null}

          <MemberReportStatusOverview
            reports={reports}
            isPartialDataset={summaryMetrics?.isPartialDataset ?? false}
          />

          <MemberRecentReports
            reports={reports}
            excludeReportId={focusReport?.id ?? null}
            totalReports={pagination?.total ?? 0}
          />

          <MemberDashboardQuickActions />
        </>
      ) : null}
    </section>
  );
}
