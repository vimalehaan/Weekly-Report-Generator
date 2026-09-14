import type { RoleName } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  role: RoleName;
};
