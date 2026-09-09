import type { RoleName } from "@prisma/client";

export type SafeUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  isActive: boolean;
};
