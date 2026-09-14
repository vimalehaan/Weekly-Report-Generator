import type { RoleName, User } from "@/types/auth";

export type UserListFilters = {
  role?: RoleName;
  isActive?: boolean;
};

export type ManagedUser = User & {
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
};

export type UserListResponse = {
  data: ManagedUser[];
};

export type UserResponse = {
  data: ManagedUser;
};
