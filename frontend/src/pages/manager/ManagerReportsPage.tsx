import { useCallback, useEffect, useState } from "react";
import {
  ManagerReportFilters,
  type ManagerReportFilterValues,
} from "@/components/reports/manager/ManagerReportFilters";
import { ManagerReportList } from "@/components/reports/manager/ManagerReportList";
import { ReportPagination } from "@/components/reports/ReportPagination";
import { Button } from "@/components/ui/button";
import { getReports } from "@/services/reports";
import { getUsers } from "@/services/users";
import type { User } from "@/types/auth";
import type { PaginationMeta, ReportListItem } from "@/types/report";
import { getApiErrorMessage } from "@/utils/api-errors";
import { isMondayWeekStart } from "@/utils/report-dates";

type LoadState = "loading" | "success" | "error";

const EMPTY_FILTERS: ManagerReportFilterValues = {
  status: "",
  weekStartDate: "",
  userId: "",
};

export function ManagerReportsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] =
    useState<ManagerReportFilterValues>(EMPTY_FILTERS);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [membersLoadError, setMembersLoadError] = useState<string | null>(null);

  const loadTeamMembers = useCallback(async () => {
    setMembersLoadError(null);

    try {
      const users = await getUsers({
        role: "TEAM_MEMBER",
        isActive: true,
      });
      setTeamMembers(users);
    } catch (error) {
      setMembersLoadError(getApiErrorMessage(error));
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const result = await getReports({
        page,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.weekStartDate && isMondayWeekStart(filters.weekStartDate)
          ? { weekStartDate: filters.weekStartDate }
          : {}),
        ...(filters.userId ? { userId: filters.userId } : {}),
      });
      setReports(result.reports);
      setPagination(result.pagination);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [filters, page]);

  useEffect(() => {
    void loadTeamMembers();
  }, [loadTeamMembers]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  function handleFiltersChange(next: ManagerReportFilterValues) {
    setFilters(next);
    setPage(1);
  }

  function handleRetry() {
    void loadReports();
  }

  const hasActiveFilters =
    filters.status !== "" ||
    filters.weekStartDate !== "" ||
    filters.userId !== "";

  const isEmpty =
    loadState === "success" && reports.length === 0 && pagination?.total === 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Team reports</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse weekly reports submitted by your team. Use filters to find
          reports by status, week, or team member, then open a report to
          review its contents.
        </p>
      </div>

      <ManagerReportFilters
        values={filters}
        teamMembers={teamMembers}
        membersLoadError={membersLoadError}
        disabled={loadState === "loading"}
        onChange={handleFiltersChange}
        onRetryMembers={() => {
          void loadTeamMembers();
        }}
      />

      {loadState === "loading" ? (
        <div
          className="flex min-h-[240px] items-center justify-center rounded-lg border border-border bg-card"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-sm text-muted-foreground">Loading team reports…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load team reports
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
          <h2 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? "No matching reports" : "No team reports yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters to see more reports."
              : "When team members create and submit weekly reports, they will appear here."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={() => handleFiltersChange(EMPTY_FILTERS)}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}

      {loadState === "success" && reports.length > 0 && pagination ? (
        <>
          <ManagerReportList reports={reports} />
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
