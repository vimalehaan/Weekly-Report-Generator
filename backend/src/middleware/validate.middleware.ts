import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const field = firstIssue?.path.join(".") || "body";
      const message = firstIssue?.message || "Invalid request body";

      next(new AppError(422, "VALIDATION_ERROR", `${field}: ${message}`));
      return;
    }

    req.body = result.data;
    next();
  };
}
