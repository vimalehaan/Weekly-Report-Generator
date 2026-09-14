import type { ApiErrorPayload } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function createApiError(
  status: number,
  payload: unknown,
  fallbackMessage: string,
): ApiError {
  const body = payload as ApiErrorPayload | null;

  return new ApiError(
    status,
    body?.error?.code ?? "REQUEST_FAILED",
    body?.error?.message ?? fallbackMessage,
  );
}
