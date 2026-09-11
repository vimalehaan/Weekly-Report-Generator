export type TaskType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskTypeListFilters = {
  isActive?: boolean;
};

export type TaskTypeResponse = {
  data: TaskType;
};

export type TaskTypeListResponse = {
  data: TaskType[];
};

export type CreateTaskTypeInput = {
  name: string;
  description?: string;
};

export type UpdateTaskTypeInput = {
  name?: string;
  description?: string | null;
  isActive?: boolean;
};
