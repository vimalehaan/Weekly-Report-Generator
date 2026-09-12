import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { DashboardWeekFilter } from "@/components/dashboard/DashboardWeekFilter";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { StatusByMemberChart } from "@/components/dashboard/StatusByMemberChart";
import { TaskTrendsChart } from "@/components/dashboard/TaskTrendsChart";
import { TimeByTaskTypeChart } from "@/components/dashboard/TimeByTaskTypeChart";
import { WorkloadByProjectChart } from "@/components/dashboard/WorkloadByProjectChart";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/services/dashboard";
import type { DashboardData } from "@/types/dashboard";
import { getApiErrorMessage } from "@/utils/api-errors";
import {
  getCurrentReportingWeekStart,
  isMondayWeekStart,
} from "@/utils/report-dates";

type LoadState = "loading" | "success" | "error";

export function ManagerDashboardPage() {
  const [weekStartDate, setWeekStartDate] = useState(
    getCurrentReportingWeekStart,
  );
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filters = useMemo(() => {
    if (!isMondayWeekStart(weekStartDate)) {
      return null;
    }

    return { weekStartDate };
  }, [weekStartDate]);

  const loadDashboard = useCallback(async () => {
    if (!filters) {
      return;
    }

    setLoadState("loading");
    setErrorMessage(null);

    try {
      const dashboardData = await getDashboardData(filters);
      setData(dashboardData);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [filters]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Manager dashboard
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Team reporting metrics, workload distribution, and recent workflow
          activity for the selected reporting week (Monday–Sunday, UTC).
          Defaults to the current week.
        </p>
      </div>

      <DashboardWeekFilter
        weekStartDate={weekStartDate}
        disabled={loadState === "loading"}
        onWeekStartDateChange={setWeekStartDate}
        onResetToCurrentWeek={() =>
          setWeekStartDate(getCurrentReportingWeekStart())
        }
      />

      {!filters && loadState !== "loading" ? (
        <p className="text-sm text-destructive" role="alert">
          Select a valid Monday as the reporting week start (YYYY-MM-DD).
        </p>
      ) : null}

      {loadState === "loading" ? (
        <div
          className="flex min-h-[320px] items-center justify-center rounded-lg border border-border bg-card"
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

      {loadState === "success" && data ? (
        <>
          <DashboardSummaryCards summary={data.summary} />

          <div className="grid gap-6 xl:grid-cols-2">
            <TaskTrendsChart data={data.taskTrends} />
            <StatusByMemberChart data={data.statusByMember} />
            <WorkloadByProjectChart data={data.workloadByProject} />
            <TimeByTaskTypeChart data={data.timeByTaskType} />
          </div>

          <RecentActivityList items={data.recentActivity} />
        </>
      ) : null}
    </section>
  );
}
