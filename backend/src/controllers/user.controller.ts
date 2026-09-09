import { RoleName } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "../types/auth.js";
import type { GetUsersFilters } from "../services/user.service.js";
import * as userService from "../services/user.service.js";

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

function parseRoleFilter(value: unknown): RoleName | undefined {
  if (value === RoleName.TEAM_MEMBER || value === RoleName.MANAGER) {
    return value;
  }

  return undefined;
}

function parseUserFilters(query: Request["query"]): GetUsersFilters {
  const filters: GetUsersFilters = {};
  const role = parseRoleFilter(query.role);
  const isActive = parseIsActiveFilter(query.isActive);

  if (role !== undefined) {
    filters.role = role;
  }

  if (isActive !== undefined) {
    filters.isActive = isActive;
  }

  return filters;
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const users = await userService.getUsers(authUser, parseUserFilters(req.query));
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const user = await userService.getUserById(authUser, req.params.id!);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authUser = getAuthenticatedUser(req, res);
    if (!authUser) {
      return;
    }

    const user = await userService.updateUser(
      authUser,
      req.params.id!,
      req.body,
    );
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}
