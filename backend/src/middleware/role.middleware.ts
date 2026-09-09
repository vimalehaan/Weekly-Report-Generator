import { RoleName } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

const unauthorizedResponse = {
  error: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
  },
} as const;

const forbiddenResponse = {
  error: {
    code: "FORBIDDEN",
    message: "Insufficient permissions",
  },
} as const;

export function requireRole(...allowedRoles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(unauthorizedResponse);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json(forbiddenResponse);
      return;
    }

    next();
  };
}
