import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TaskTypeListFilters } from "@/components/task-types/TaskTypeListFilters";
import {
  activeStatusFilterToApi,
  type ActiveStatusFilterValues,
} from "@/utils/active-status-filter";
import { TaskTypeList } from "@/components/task-types/TaskTypeList";
import { Button, buttonVariants } from "@/components/ui/button";
import { getTaskTypes } from "@/services/task-types";
import { ROUTES } from "@/routes/paths";
import type { TaskType } from "@/types/task-type";
import { getApiErrorMessage } from "@/utils/api-errors";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "error";

const EMPTY_FILTERS: ActiveStatusFilterValues = {
  activeStatus: "all",
};

export function ManagerTaskTypesPage() {
  const [filters, setFilters] =
    useState<ActiveStatusFilterValues>(EMPTY_FILTERS);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTaskTypes = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const data = await getTaskTypes(
        activeStatusFilterToApi(filters.activeStatus),
      );
      setTaskTypes(data);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [filters]);

  useEffect(() => {
    void loadTaskTypes();
  }, [loadTaskTypes]);

  const hasActiveFilters = filters.activeStatus !== "all";
  const isEmpty = loadState === "success" && taskTypes.length === 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Task type management
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Configure task categories available when team members log weekly
            report tasks. Deactivating a task type removes it from new
            selections but preserves historical report data.
          </p>
        </div>

        <Link
          to={ROUTES.manager.taskTypesNew}
          className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          New task type
        </Link>
      </div>

      <TaskTypeListFilters
        values={filters}
        disabled={loadState === "loading"}
        onChange={setFilters}
      />

      {loadState === "loading" ? (
        <div
          className="flex min-h-[240px] items-center justify-center rounded-lg border border-border bg-card"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="text-sm text-muted-foreground">Loading task types…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load task types
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadTaskTypes();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? "No matching task types" : "No task types yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Create a task type so team members can categorize work in their reports."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Clear filters
            </Button>
          ) : (
            <Link
              to={ROUTES.manager.taskTypesNew}
              className={cn(buttonVariants({ size: "sm" }), "mt-6 inline-flex")}
            >
              Create task type
            </Link>
          )}
        </div>
      ) : null}

      {loadState === "success" && taskTypes.length > 0 ? (
        <TaskTypeList taskTypes={taskTypes} />
      ) : null}
    </section>
  );
}
