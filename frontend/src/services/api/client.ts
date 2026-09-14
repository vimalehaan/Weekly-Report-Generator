import { getApiBaseUrl } from "@/constants/env";
import { ApiError, createApiError } from "@/services/api/api-error";
import { dispatchUnauthorizedSession } from "@/services/api/unauthorized-session";

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function buildUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  return response.json() as Promise<unknown>;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(buildUrl(path), {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      dispatchUnauthorizedSession();
    }

    throw createApiError(response.status, payload, response.statusText);
  }

  return payload as T;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
