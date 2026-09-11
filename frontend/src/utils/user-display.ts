import type { User } from "@/types/auth";

export function formatUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
