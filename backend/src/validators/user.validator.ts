import { RoleName } from "@prisma/client";
import { z } from "zod";

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const getUsersQuerySchema = z
  .object({
    role: z.nativeEnum(RoleName).optional(),
    isActive: queryBooleanSchema.optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name cannot be empty").optional(),
    lastName: z.string().trim().min(1, "Last name cannot be empty").optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one field is required",
    },
  );

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
