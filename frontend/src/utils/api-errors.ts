import { isApiError } from "@/services/api";

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message || "Something went wrong. Please try again.";
  }

  if (error instanceof TypeError) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
