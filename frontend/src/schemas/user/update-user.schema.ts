import { z } from "zod";

export const updateUserFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name cannot be empty"),
  lastName: z.string().trim().min(1, "Last name cannot be empty"),
});

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
