import { apiRequest } from "@/services/api";
import type {
  CreateTaskTypeInput,
  TaskType,
  TaskTypeListFilters,
  TaskTypeListResponse,
  TaskTypeResponse,
  UpdateTaskTypeInput,
} from "@/types/task-type";
import { buildQueryString } from "@/utils/query-string";

const TASK_TYPES_BASE_PATH = "/api/v1/task-types";

export async function getTaskTypes(
  filters: TaskTypeListFilters = {},
): Promise<TaskType[]> {
  const query = buildQueryString({
    isActive: filters.isActive,
  });

  const response = await apiRequest<TaskTypeListResponse>(
    `${TASK_TYPES_BASE_PATH}${query}`,
  );

  return response.data;
}

export async function getTaskTypeById(taskTypeId: string): Promise<TaskType> {
  const response = await apiRequest<TaskTypeResponse>(
    `${TASK_TYPES_BASE_PATH}/${taskTypeId}`,
  );

  return response.data;
}

export async function createTaskType(
  input: CreateTaskTypeInput,
): Promise<TaskType> {
  const body: CreateTaskTypeInput = {
    name: input.name.trim(),
  };

  if (input.description !== undefined) {
    const trimmed = input.description.trim();
    if (trimmed.length > 0) {
      body.description = trimmed;
    }
  }

  const response = await apiRequest<TaskTypeResponse>(TASK_TYPES_BASE_PATH, {
    method: "POST",
    body,
  });

  return response.data;
}

export async function updateTaskType(
  taskTypeId: string,
  input: UpdateTaskTypeInput,
): Promise<TaskType> {
  const response = await apiRequest<TaskTypeResponse>(
    `${TASK_TYPES_BASE_PATH}/${taskTypeId}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}

export async function deactivateTaskType(taskTypeId: string): Promise<TaskType> {
  const response = await apiRequest<TaskTypeResponse>(
    `${TASK_TYPES_BASE_PATH}/${taskTypeId}`,
    {
      method: "DELETE",
    },
  );

  return response.data;
}
