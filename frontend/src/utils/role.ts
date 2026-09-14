import type { RoleName } from "@/types/auth";

export function formatRoleName(role: RoleName): string {
  if (role === "TEAM_MEMBER") {
    return "Team Member";
  }

  return "Manager";
}
