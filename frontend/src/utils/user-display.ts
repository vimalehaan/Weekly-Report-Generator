import type { RoleName } from "@/types/auth";
import type { User } from "@/types/auth";

export function formatUserDisplayName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function formatRoleLabel(role: RoleName): string {
  if (role === "MANAGER") {
    return "Manager";
  }

  return "Team member";
}
