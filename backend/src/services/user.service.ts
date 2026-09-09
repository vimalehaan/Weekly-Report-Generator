import { Prisma, RoleName } from "@prisma/client";
import { prisma } from "../config/database.js";
import type { JwtPayload } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

export type GetUsersFilters = {
  role?: RoleName;
  isActive?: boolean;
};

export type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
};

export type SafeUserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: RoleName;
  createdAt: Date;
  updatedAt: Date;
};

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      name: true,
    },
  },
} as const;

type UserWithRole = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

function assertManager(authUser: JwtPayload): void {
  if (authUser.role !== RoleName.MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Insufficient permissions");
  }
}

function toSafeUser(user: UserWithRole): SafeUserRecord {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    role: user.role.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function validatePersonName(value: string, fieldName: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      `${fieldName} is required`,
    );
  }

  return trimmedValue;
}

export async function getUsers(
  authUser: JwtPayload,
  filters: GetUsersFilters = {},
) {
  assertManager(authUser);

  const where: Prisma.UserWhereInput = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.role !== undefined) {
    where.role = {
      name: filters.role,
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: safeUserSelect,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }],
  });

  return users.map(toSafeUser);
}

export async function getUserById(authUser: JwtPayload, userId: string) {
  assertManager(authUser);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return toSafeUser(user);
}

export async function updateUser(
  authUser: JwtPayload,
  userId: string,
  input: UpdateUserInput,
) {
  assertManager(authUser);

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  const data: Prisma.UserUpdateInput = {};

  if (input.firstName !== undefined) {
    data.firstName = validatePersonName(input.firstName, "First name");
  }

  if (input.lastName !== undefined) {
    data.lastName = validatePersonName(input.lastName, "Last name");
  }

  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
  }

  if (Object.keys(data).length === 0) {
    return getUserById(authUser, userId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: safeUserSelect,
  });

  return toSafeUser(user);
}
