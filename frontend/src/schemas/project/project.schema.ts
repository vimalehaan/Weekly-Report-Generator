import { z } from "zod";

export const createProjectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;

export const updateProjectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim(),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectFormSchema>;
