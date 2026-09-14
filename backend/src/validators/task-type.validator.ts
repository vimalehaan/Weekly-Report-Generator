import { z } from "zod";

const optionalDescriptionSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const createTaskTypeSchema = z
  .object({
    name: z.string().trim().min(1, "Task type name is required"),
    description: optionalDescriptionSchema,
  })
  .strict();

export const updateTaskTypeSchema = z
  .object({
    name: z.string().trim().min(1, "Task type name is required").optional(),
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one field is required",
    },
  );

export const getTaskTypesQuerySchema = z
  .object({
    isActive: queryBooleanSchema.optional(),
  })
  .strict();

export type CreateTaskTypeInput = z.infer<typeof createTaskTypeSchema>;
export type UpdateTaskTypeInput = z.infer<typeof updateTaskTypeSchema>;
export type GetTaskTypesFilters = z.infer<typeof getTaskTypesQuerySchema>;
