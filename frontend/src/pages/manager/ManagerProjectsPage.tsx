import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProjectListFilters } from "@/components/projects/ProjectListFilters";
import {
  activeStatusFilterToApi,
  type ActiveStatusFilterValues,
} from "@/utils/active-status-filter";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button, buttonVariants } from "@/components/ui/button";
import { getProjects } from "@/services/projects";
import { ROUTES } from "@/routes/paths";
import type { Project } from "@/types/project";
import { getApiErrorMessage } from "@/utils/api-errors";
import { cn } from "@/lib/utils";

type LoadState = "loading" | "success" | "error";

const EMPTY_FILTERS: ActiveStatusFilterValues = {
  activeStatus: "all",
};

export function ManagerProjectsPage() {
  const [filters, setFilters] =
    useState<ActiveStatusFilterValues>(EMPTY_FILTERS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const data = await getProjects(activeStatusFilterToApi(filters.activeStatus));
      setProjects(data);
      setLoadState("success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setLoadState("error");
    }
  }, [filters]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const hasActiveFilters = filters.activeStatus !== "all";
  const isEmpty = loadState === "success" && projects.length === 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Project management
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Maintain the project catalog used when team members log weekly
            report tasks. Deactivating a project removes it from new selections
            but preserves historical report data.
          </p>
        </div>

        <Link
          to={ROUTES.manager.projectsNew}
          className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          New project
        </Link>
      </div>

      <ProjectListFilters
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
          <p className="text-sm text-muted-foreground">Loading projects…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Could not load projects
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              void loadProjects();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <h2 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? "No matching projects" : "No projects yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Create a project so team members can assign tasks in their weekly reports."}
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
              to={ROUTES.manager.projectsNew}
              className={cn(buttonVariants({ size: "sm" }), "mt-6 inline-flex")}
            >
              Create project
            </Link>
          )}
        </div>
      ) : null}

      {loadState === "success" && projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : null}
    </section>
  );
}
