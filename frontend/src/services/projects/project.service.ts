import { apiRequest } from "@/services/api";
import type {
  CreateProjectInput,
  Project,
  ProjectListFilters,
  ProjectListResponse,
  ProjectResponse,
  UpdateProjectInput,
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

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const body: CreateProjectInput = {
    name: input.name.trim(),
  };

  if (input.description !== undefined) {
    const trimmed = input.description.trim();
    if (trimmed.length > 0) {
      body.description = trimmed;
    }
  }

  const response = await apiRequest<ProjectResponse>(PROJECTS_BASE_PATH, {
    method: "POST",
    body,
  });

  return response.data;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const response = await apiRequest<ProjectResponse>(
    `${PROJECTS_BASE_PATH}/${projectId}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}

export async function deactivateProject(projectId: string): Promise<Project> {
  const response = await apiRequest<ProjectResponse>(
    `${PROJECTS_BASE_PATH}/${projectId}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}
