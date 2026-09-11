export type Project = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectListFilters = {
  isActive?: boolean;
};

export type ProjectResponse = {
  data: Project;
};

export type ProjectListResponse = {
  data: Project[];
};
