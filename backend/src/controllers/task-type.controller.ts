import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "../types/auth.js";
import type { GetTaskTypesFilters } from "../services/task-type.service.js";
import * as taskTypeService from "../services/task-type.service.js";

const unauthorizedResponse = {
  error: {
    code: "UNAUTHORIZED",
    message: "Authentication required",
  },
} as const;

function getAuthenticatedUser(
  req: Request,
  res: Response,
): JwtPayload | undefined {
  if (!req.user) {
    res.status(401).json(unauthorizedResponse);
    return undefined;
  }

  return req.user;
}

function parseIsActiveFilter(value: unknown): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseTaskTypeFilters(query: Request["query"]): GetTaskTypesFilters {
  const isActive = parseIsActiveFilter(query.isActive);

  return isActive !== undefined ? { isActive } : {};
}

export async function createTaskType(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const taskType = await taskTypeService.createTaskType(authUser, req.body);
    res.status(201).json({ data: taskType });
  } catch (error) {
    next(error);
  }
}

export async function getTaskTypes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const taskTypes = await taskTypeService.getTaskTypes(
      authUser,
      parseTaskTypeFilters(req.query),
    );
    res.status(200).json({ data: taskTypes });
  } catch (error) {
    next(error);
  }
}

export async function getTaskTypeById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const taskType = await taskTypeService.getTaskTypeById(
      authUser,
      req.params.id!,
    );
    res.status(200).json({ data: taskType });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskType(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const taskType = await taskTypeService.updateTaskType(
      authUser,
      req.params.id!,
      req.body,
    );
    res.status(200).json({ data: taskType });
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskType(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const taskType = await taskTypeService.deleteTaskType(
      authUser,
      req.params.id!,
    );
    res.status(200).json({ data: taskType });
  } catch (error) {
    next(error);
  }
}
