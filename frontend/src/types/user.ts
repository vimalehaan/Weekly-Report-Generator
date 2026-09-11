import type { RoleName, User } from "@/types/auth";

export type UserListFilters = {
  role?: RoleName;
  isActive?: boolean;
};

export type UserListResponse = {
  data: User[];
};
