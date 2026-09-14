import { z } from "zod";

export const createTaskTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Task type name is required"),
  description: z.string().trim().optional(),
});

export type CreateTaskTypeFormValues = z.infer<typeof createTaskTypeFormSchema>;

export const updateTaskTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Task type name is required"),
  description: z.string().trim(),
});

export type UpdateTaskTypeFormValues = z.infer<typeof updateTaskTypeFormSchema>;
