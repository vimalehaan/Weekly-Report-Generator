import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

type HandledError = ErrorResponse & {
  statusCode: number;
};

function handlePrismaKnownRequestError(
  err: Prisma.PrismaClientKnownRequestError,
): HandledError {
  switch (err.code) {
    case "P2002":
      return {
        statusCode: 409,
        error: {
          code: "CONFLICT",
          message: "A resource with this value already exists",
        },
      };
    case "P2025":
      return {
        statusCode: 404,
        error: {
          code: "NOT_FOUND",
          message: "Record not found",
        },
      };
    case "P2003":
      return {
        statusCode: 409,
        error: {
          code: "INVALID_REFERENCE",
          message: "Referenced record does not exist",
        },
      };
    default:
      return {
        statusCode: 500,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      };
  }
}

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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (!env.isProduction) {
      console.error(err);
    }

    const { statusCode, error } = handlePrismaKnownRequestError(err);
    res.status(statusCode).json({ error });
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
