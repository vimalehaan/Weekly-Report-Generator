import { isApiError } from "@/services/api";

export function getAuthErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case "INVALID_CREDENTIALS":
        return "Invalid email or password.";
      case "DUPLICATE_EMAIL":
        return "An account with this email already exists.";
      case "VALIDATION_ERROR":
        return error.message;
      case "UNAUTHORIZED":
        return "Your session has expired. Please sign in again.";
      default:
        return error.message || "Something went wrong. Please try again.";
    }
  }

  if (error instanceof TypeError) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
