import { apiRequest } from "@/services/api";
import type {
  TaskType,
  TaskTypeListFilters,
  TaskTypeListResponse,
  TaskTypeResponse,
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
