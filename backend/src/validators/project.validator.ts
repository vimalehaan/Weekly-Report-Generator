import { z } from "zod";

const optionalDescriptionSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: optionalDescriptionSchema,
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Project name is required").optional(),
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one field is required",
    },
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
