import { apiRequest } from "@/services/api";
import type { User } from "@/types/auth";
import type { UserListFilters, UserListResponse } from "@/types/user";
import { buildQueryString } from "@/utils/query-string";

const USERS_BASE_PATH = "/api/v1/users";

export async function getUsers(filters: UserListFilters = {}): Promise<User[]> {
  const query = buildQueryString({
    role: filters.role,
    isActive: filters.isActive,
  });

  const response = await apiRequest<UserListResponse>(
    `${USERS_BASE_PATH}${query}`,
  );

  return response.data;
}
