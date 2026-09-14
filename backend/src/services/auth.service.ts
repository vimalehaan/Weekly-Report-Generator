import { RoleName } from "@prisma/client";
import { prisma } from "../config/database.js";
import type { SafeUser } from "../types/user.js";
import { AppError } from "../utils/app-error.js";
import { generateAccessToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validator.js";

type UserWithRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: {
    name: RoleName;
  };
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toSafeUser(user: UserWithRole): SafeUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    isActive: user.isActive,
  };
}

const userWithRoleSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  isActive: true,
  passwordHash: true,
  role: {
    select: {
      name: true,
    },
  },
} as const;

export async function register(input: RegisterInput): Promise<SafeUser> {
  const email = normalizeEmail(input.email);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(409, "DUPLICATE_EMAIL", "Email is already registered");
  }

  const teamMemberRole = await prisma.role.findUnique({
    where: { name: RoleName.TEAM_MEMBER },
    select: { id: true },
  });

  if (!teamMemberRole) {
    throw new AppError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Default team member role is not configured",
    );
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      passwordHash,
      roleId: teamMemberRole.id,
    },
    select: userWithRoleSelect,
  });

  return toSafeUser(user);
}

export async function login(
  input: LoginInput,
): Promise<{ user: SafeUser; accessToken: string }> {
  const email = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: userWithRoleSelect,
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (!user.isActive) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  return {
    user: toSafeUser(user),
    accessToken,
  };
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  return toSafeUser(user);
}
