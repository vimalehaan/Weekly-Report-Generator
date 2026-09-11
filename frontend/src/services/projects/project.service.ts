import { apiRequest } from "@/services/api";
import type {
  Project,
  ProjectListFilters,
  ProjectListResponse,
  ProjectResponse,
} from "@/types/project";
import { buildQueryString } from "@/utils/query-string";

const PROJECTS_BASE_PATH = "/api/v1/projects";

export async function getProjects(
  filters: ProjectListFilters = {},
): Promise<Project[]> {
  const query = buildQueryString({
    isActive: filters.isActive,
  });

  const response = await apiRequest<ProjectListResponse>(
    `${PROJECTS_BASE_PATH}${query}`,
  );

  return response.data;
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await apiRequest<ProjectResponse>(
    `${PROJECTS_BASE_PATH}/${projectId}`,
  );

  return response.data;
}
