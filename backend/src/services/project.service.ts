import { Prisma, RoleName } from "@prisma/client";
import { prisma } from "../config/database.js";
import type { JwtPayload } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

export type CreateProjectInput = {
  name: string;
  description?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export type GetProjectsFilters = {
  isActive?: boolean;
};

const projectSelect = {
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
    throw new AppError(422, "VALIDATION_ERROR", "Project name is required");
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

function handleDuplicateProjectError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      409,
      "DUPLICATE_PROJECT",
      "A project with this name already exists",
    );
  }

  throw error;
}

async function findDuplicateProjectByName(name: string, excludeProjectId?: string) {
  const existingProject = await prisma.project.findUnique({
    where: { name },
    select: { id: true },
  });

  if (!existingProject) {
    return null;
  }

  if (excludeProjectId && existingProject.id === excludeProjectId) {
    return null;
  }

  return existingProject;
}

export async function createProject(
  authUser: JwtPayload,
  input: CreateProjectInput,
) {
  assertManager(authUser);

  const name = validateName(input.name);
  const description = normalizeDescription(input.description);

  const duplicateProject = await findDuplicateProjectByName(name);
  if (duplicateProject) {
    throw new AppError(
      409,
      "DUPLICATE_PROJECT",
      "A project with this name already exists",
    );
  }

  try {
    return await prisma.project.create({
      data: {
        name,
        description,
        isActive: true,
      },
      select: projectSelect,
    });
  } catch (error) {
    handleDuplicateProjectError(error);
  }
}

export async function getProjects(
  _authUser: JwtPayload,
  filters: GetProjectsFilters = {},
) {
  const where: Prisma.ProjectWhereInput = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return prisma.project.findMany({
    where,
    select: projectSelect,
    orderBy: {
      name: "asc",
    },
  });
}

export async function getProjectById(_authUser: JwtPayload, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: projectSelect,
  });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  return project;
}

export async function updateProject(
  authUser: JwtPayload,
  projectId: string,
  input: UpdateProjectInput,
) {
  assertManager(authUser);

  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!existingProject) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  const data: Prisma.ProjectUpdateInput = {};

  if (input.name !== undefined) {
    const name = validateName(input.name);
    const duplicateProject = await findDuplicateProjectByName(name, projectId);

    if (duplicateProject) {
      throw new AppError(
        409,
        "DUPLICATE_PROJECT",
        "A project with this name already exists",
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
    return getProjectById(authUser, projectId);
  }

  try {
    return await prisma.project.update({
      where: { id: projectId },
      data,
      select: projectSelect,
    });
  } catch (error) {
    handleDuplicateProjectError(error);
  }
}

export async function deleteProject(authUser: JwtPayload, projectId: string) {
  assertManager(authUser);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: projectSelect,
  });

  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found");
  }

  if (!project.isActive) {
    return project;
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      isActive: false,
    },
    select: projectSelect,
  });
}
