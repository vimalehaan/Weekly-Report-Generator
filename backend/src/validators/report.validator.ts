import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const dateStringSchema = z
  .string()
  .date("Must be a valid date string (YYYY-MM-DD)");

const uuidSchema = z.string().uuid("Must be a valid UUID");

const percentageSchema = z
  .number()
  .int("Must be a whole number")
  .min(0, "Must be at least 0")
  .max(100, "Must be at most 100");

const hoursSchema = z
  .number()
  .min(0, "Must be greater than or equal to 0");

export const reportTaskInputSchema = z.object({
  projectId: uuidSchema,
  taskTypeId: uuidSchema.nullish(),
  taskName: z.string().trim().min(1, "Task name is required"),
  priority: z.nativeEnum(TaskPriority),
  plannedPercentage: percentageSchema,
  actualPercentage: percentageSchema,
  status: z.nativeEnum(TaskStatus),
  plannedHours: hoursSchema,
  spentHours: hoursSchema,
  deliverable: z.string().trim().optional(),
});

export const achievementInputSchema = z.object({
  description: z.string().trim().min(1, "Achievement description is required"),
  isKeyAchievement: z.boolean(),
});

export const blockerInputSchema = z.object({
  description: z.string().trim().min(1, "Blocker description is required"),
  isKeyIssue: z.boolean(),
});

const reportFieldsSchema = z.object({
  weekStartDate: dateStringSchema,
  weekEndDate: dateStringSchema,
  tasks: z.array(reportTaskInputSchema),
  nextWeekTasks: z.array(z.string()),
  achievements: z.array(achievementInputSchema),
  blockers: z.array(blockerInputSchema),
  notes: z.string().trim().optional(),
});

function weekDateRefinement(data: {
  weekStartDate: string;
  weekEndDate: string;
}): boolean {
  return data.weekEndDate >= data.weekStartDate;
}

const weekDateRefinementOptions = {
  message: "weekEndDate must not be before weekStartDate",
  path: ["weekEndDate"],
};

export const createReportSchema = reportFieldsSchema.refine(
  weekDateRefinement,
  weekDateRefinementOptions,
);

export const updateReportSchema = reportFieldsSchema
  .partial()
  .refine(
    (data) => {
      if (data.weekStartDate !== undefined && data.weekEndDate !== undefined) {
        return weekDateRefinement({
          weekStartDate: data.weekStartDate,
          weekEndDate: data.weekEndDate,
        });
      }

      return true;
    },
    weekDateRefinementOptions,
  );

export type ReportTaskInput = z.infer<typeof reportTaskInputSchema>;
export type AchievementInput = z.infer<typeof achievementInputSchema>;
export type BlockerInput = z.infer<typeof blockerInputSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
