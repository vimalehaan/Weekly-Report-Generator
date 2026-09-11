import { useCallback, useEffect, useState } from "react";
import { getProjects } from "@/services/projects";
import { getTaskTypes } from "@/services/task-types";
import type { Report } from "@/types/report";
import type { Project } from "@/types/project";
import type { TaskType } from "@/types/task-type";
import { getApiErrorMessage } from "@/utils/api-errors";
import {
  mergeProjectsForForm,
  mergeTaskTypesForForm,
} from "@/utils/merge-catalog-options";

type CatalogState = "idle" | "loading" | "ready" | "error";

type UseReportCatalogOptions = {
  report?: Report | null;
  enabled?: boolean;
};

type UseReportCatalogResult = {
  catalogState: CatalogState;
  catalogError: string | null;
  projects: Project[];
  taskTypes: TaskType[];
  reloadCatalog: () => Promise<void>;
  catalogReady: boolean;
};

export function useReportCatalog(
  options: UseReportCatalogOptions = {},
): UseReportCatalogResult {
  const { report = null, enabled = true } = options;
  const [catalogState, setCatalogState] = useState<CatalogState>("idle");
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);

  const reloadCatalog = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setCatalogState("loading");
    setCatalogError(null);

    try {
      const [activeProjects, activeTaskTypes] = await Promise.all([
        getProjects({ isActive: true }),
        getTaskTypes({ isActive: true }),
      ]);

      setProjects(mergeProjectsForForm(activeProjects, report));
      setTaskTypes(mergeTaskTypesForForm(activeTaskTypes, report));
      setCatalogState("ready");
    } catch (error) {
      setCatalogError(getApiErrorMessage(error));
      setCatalogState("error");
    }
  }, [enabled, report]);

  useEffect(() => {
    if (!enabled) {
      setCatalogState("idle");
      return;
    }

    void reloadCatalog();
  }, [enabled, reloadCatalog]);

  return {
    catalogState,
    catalogError,
    projects,
    taskTypes,
    reloadCatalog,
    catalogReady: catalogState === "ready",
  };
}
