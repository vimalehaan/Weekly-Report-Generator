import { apiRequest, isApiError } from "@/services/api";
import type {
  AuthUserResponse,
  LoginInput,
  LogoutResponse,
  RegisterInput,
  User,
} from "@/types/auth";

const AUTH_BASE_PATH = "/api/v1/auth";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await apiRequest<AuthUserResponse>(`${AUTH_BASE_PATH}/register`, {
    method: "POST",
    body: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalizeEmail(input.email),
      password: input.password,
    },
  });

  return response.data.user;
}

export async function login(input: LoginInput): Promise<User> {
  const response = await apiRequest<AuthUserResponse>(`${AUTH_BASE_PATH}/login`, {
    method: "POST",
    body: {
      email: normalizeEmail(input.email),
      password: input.password,
    },
  });

  return response.data.user;
}

export async function logout(): Promise<void> {
  await apiRequest<LogoutResponse>(`${AUTH_BASE_PATH}/logout`, {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest<AuthUserResponse>(`${AUTH_BASE_PATH}/me`);
    return response.data.user;
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 404)) {
      return null;
    }

    throw error;
  }
}
