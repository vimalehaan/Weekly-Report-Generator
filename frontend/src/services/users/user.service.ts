import { apiRequest } from "@/services/api";
import type {
  ManagedUser,
  UpdateUserInput,
  UserListFilters,
  UserListResponse,
  UserResponse,
} from "@/types/user";
import { buildQueryString } from "@/utils/query-string";

const USERS_BASE_PATH = "/api/v1/users";

export async function getUsers(
  filters: UserListFilters = {},
): Promise<ManagedUser[]> {
  const query = buildQueryString({
    role: filters.role,
    isActive: filters.isActive,
  });

  const response = await apiRequest<UserListResponse>(
    `${USERS_BASE_PATH}${query}`,
  );

  return response.data;
}

export async function getUserById(userId: string): Promise<ManagedUser> {
  const response = await apiRequest<UserResponse>(
    `${USERS_BASE_PATH}/${userId}`,
  );

  return response.data;
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
): Promise<ManagedUser> {
  const response = await apiRequest<UserResponse>(
    `${USERS_BASE_PATH}/${userId}`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}
