import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  };

  res.status(404).json(response);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof Error) {
    if (!env.isProduction) {
      console.error(err);
    }

    const response: ErrorResponse = {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: env.isProduction
          ? "An unexpected error occurred"
          : err.message,
      },
    };

    res.status(500).json(response);
    return;
  }

  const response: ErrorResponse = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  };

  res.status(500).json(response);
}
