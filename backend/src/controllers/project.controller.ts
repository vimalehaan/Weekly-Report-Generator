import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "../types/auth.js";
import type { GetProjectsFilters } from "../services/project.service.js";
import * as projectService from "../services/project.service.js";

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

function parseProjectFilters(query: Request["query"]): GetProjectsFilters {
  const isActive = parseIsActiveFilter(query.isActive);

  return isActive !== undefined ? { isActive } : {};
}

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const project = await projectService.createProject(authUser, req.body);
    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const projects = await projectService.getProjects(
      authUser,
      parseProjectFilters(req.query),
    );
    res.status(200).json({ data: projects });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const project = await projectService.getProjectById(
      authUser,
      req.params.id!,
    );
    res.status(200).json({ data: project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const project = await projectService.updateProject(
      authUser,
      req.params.id!,
      req.body,
    );
    res.status(200).json({ data: project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const project = await projectService.deleteProject(
      authUser,
      req.params.id!,
    );
    res.status(200).json({ data: project });
  } catch (error) {
    next(error);
  }
}
