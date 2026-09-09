import { Prisma, RoleName } from "@prisma/client";
import { prisma } from "../config/database.js";
import type { JwtPayload } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

export type CreateTaskTypeInput = {
  name: string;
  description?: string;
};

export type UpdateTaskTypeInput = {
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export type GetTaskTypesFilters = {
  isActive?: boolean;
};

const taskTypeSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function assertManager(authUser: JwtPayload): void {
  if (authUser.role !== RoleName.MANAGER) {
    throw new AppError(403, "FORBIDDEN", "Insufficient permissions");
  }
}

function normalizeName(name: string): string {
  return name.trim();
}

function validateName(name: string): string {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    throw new AppError(422, "VALIDATION_ERROR", "Task type name is required");
  }

  return normalizedName;
}

function normalizeDescription(description?: string): string | undefined {
  if (description === undefined) {
    return undefined;
  }

  const trimmedDescription = description.trim();
  return trimmedDescription.length > 0 ? trimmedDescription : undefined;
}

function handleDuplicateTaskTypeError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      409,
      "DUPLICATE_TASK_TYPE",
      "A task type with this name already exists",
    );
  }

  throw error;
}

async function findDuplicateTaskTypeByName(
  name: string,
  excludeTaskTypeId?: string,
) {
  const existingTaskType = await prisma.taskType.findUnique({
    where: { name },
    select: { id: true },
  });

  if (!existingTaskType) {
    return null;
  }

  if (excludeTaskTypeId && existingTaskType.id === excludeTaskTypeId) {
    return null;
  }

  return existingTaskType;
}

export async function createTaskType(
  authUser: JwtPayload,
  input: CreateTaskTypeInput,
) {
  assertManager(authUser);

  const name = validateName(input.name);
  const description = normalizeDescription(input.description);

  const duplicateTaskType = await findDuplicateTaskTypeByName(name);
  if (duplicateTaskType) {
    throw new AppError(
      409,
      "DUPLICATE_TASK_TYPE",
      "A task type with this name already exists",
    );
  }

  try {
    return await prisma.taskType.create({
      data: {
        name,
        description,
        isActive: true,
      },
      select: taskTypeSelect,
    });
  } catch (error) {
    handleDuplicateTaskTypeError(error);
  }
}

export async function getTaskTypes(
  authUser: JwtPayload,
  filters: GetTaskTypesFilters = {},
) {
  assertManager(authUser);

  const where: Prisma.TaskTypeWhereInput = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return prisma.taskType.findMany({
    where,
    select: taskTypeSelect,
    orderBy: {
      name: "asc",
    },
  });
}

export async function getTaskTypeById(authUser: JwtPayload, taskTypeId: string) {
  assertManager(authUser);

  const taskType = await prisma.taskType.findUnique({
    where: { id: taskTypeId },
    select: taskTypeSelect,
  });

  if (!taskType) {
    throw new AppError(404, "TASK_TYPE_NOT_FOUND", "Task type not found");
  }

  return taskType;
}

export async function updateTaskType(
  authUser: JwtPayload,
  taskTypeId: string,
  input: UpdateTaskTypeInput,
) {
  assertManager(authUser);

  const existingTaskType = await prisma.taskType.findUnique({
    where: { id: taskTypeId },
    select: { id: true },
  });

  if (!existingTaskType) {
    throw new AppError(404, "TASK_TYPE_NOT_FOUND", "Task type not found");
  }

  const data: Prisma.TaskTypeUpdateInput = {};

  if (input.name !== undefined) {
    const name = validateName(input.name);
    const duplicateTaskType = await findDuplicateTaskTypeByName(
      name,
      taskTypeId,
    );

    if (duplicateTaskType) {
      throw new AppError(
        409,
        "DUPLICATE_TASK_TYPE",
        "A task type with this name already exists",
      );
    }

    data.name = name;
  }

  if (input.description !== undefined) {
    data.description =
      input.description === null
        ? null
        : normalizeDescription(input.description);
  }

  if (input.isActive !== undefined) {
    data.isActive = input.isActive;
  }

  if (Object.keys(data).length === 0) {
    return getTaskTypeById(authUser, taskTypeId);
  }

  try {
    return await prisma.taskType.update({
      where: { id: taskTypeId },
      data,
      select: taskTypeSelect,
    });
  } catch (error) {
    handleDuplicateTaskTypeError(error);
  }
}

export async function deleteTaskType(authUser: JwtPayload, taskTypeId: string) {
  assertManager(authUser);

  const taskType = await prisma.taskType.findUnique({
    where: { id: taskTypeId },
    select: taskTypeSelect,
  });

  if (!taskType) {
    throw new AppError(404, "TASK_TYPE_NOT_FOUND", "Task type not found");
  }

  if (!taskType.isActive) {
    return taskType;
  }

  return prisma.taskType.update({
    where: { id: taskTypeId },
    data: {
      isActive: false,
    },
    select: taskTypeSelect,
  });
}
